#!/usr/bin/env python3
"""
Writing Engine: An OuLiPo-inflected, Markov-augmented writing prompt tool
for generating constrained blog posts with process visibility.

Designed to accumulate a corpus over time, transitioning from pure 
constraint-based prompts to Markov-generated prompts derived from
the writer's own prior work.
"""

import random
import re
import os
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict
import argparse

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG = {
    "corpus_dir": "corpus",
    "output_dir": "_posts",  # Jekyll posts directory
    "word_count_range": (200, 500),
    "markov_order": 2,
    "exquisite_corpse_fragments": 3,
}

# ============================================================================
# LIGHT CONSTRAINTS (for Freewrite mode)
# ============================================================================

class LightConstraints:
    """
    Softer formal constraints for freewrite sessions.
    These create texture without lexical paralysis.
    """
    
    STRUCTURAL = [
        {
            "name": "Circular",
            "instruction": "Begin and end your piece with the same word.",
            "category": "structural",
        },
        {
            "name": "Shared Word",
            "instruction": "Your first and last sentences must share at least one word.",
            "category": "structural",
        },
        {
            "name": "Short Paragraphs",
            "instruction": "No paragraph longer than 3 sentences.",
            "category": "structural",
        },
        {
            "name": "Single-Word Sentence",
            "instruction": "Include exactly one single-word sentence somewhere in your writing.",
            "category": "structural",
        },
        {
            "name": "Fragment Required",
            "instruction": "Include at least one grammatically incomplete sentence (a fragment).",
            "category": "structural",
        },
    ]
    
    INCLUSION = [
        {
            "name": "Color Required",
            "instruction": "Your writing must include at least one color.",
            "category": "inclusion",
        },
        {
            "name": "Body Part Required",
            "instruction": "Your writing must include at least one body part.",
            "category": "inclusion",
        },
        {
            "name": "Number Required",
            "instruction": "Your writing must include a specific number (not 'one' or 'two' but a numeral or precise count).",
            "category": "inclusion",
        },
        {
            "name": "Question Required",
            "instruction": "Your writing must include at least one question.",
            "category": "inclusion",
        },
        {
            "name": "Imperative Required",
            "instruction": "Your writing must include at least one command (imperative sentence).",
            "category": "inclusion",
        },
        {
            "name": "Sound Required",
            "instruction": "Your writing must include at least one specific sound.",
            "category": "inclusion",
        },
    ]
    
    SENTENCE_LEVEL = [
        {
            "name": "Short Sentence",
            "instruction": "Include at least one sentence of 5 words or fewer.",
            "category": "sentence",
        },
        {
            "name": "Long Sentence",
            "instruction": "Include at least one sentence of 30 words or more.",
            "category": "sentence",
        },
        {
            "name": "Sentence Variety",
            "instruction": "Include both a sentence under 5 words AND a sentence over 25 words.",
            "category": "sentence",
        },
    ]
    
    PERSPECTIVE = [
        {
            "name": "No First Person",
            "instruction": "Write without using first-person pronouns (I, me, my, mine, myself).",
            "category": "perspective",
        },
        {
            "name": "Second Person",
            "instruction": "Write in second person throughout. Address 'you'.",
            "category": "perspective",
        },
        {
            "name": "Present Tense Only",
            "instruction": "Write entirely in present tense.",
            "category": "perspective",
        },
        {
            "name": "Future Memory",
            "instruction": "Write as if remembering something that hasn't happened yet.",
            "category": "perspective",
        },
    ]
    
    AVOIDANCE = [
        {
            "name": "No 'To Be'",
            "instruction": "Avoid all forms of 'to be' (is, am, are, was, were, been, being).",
            "category": "avoidance",
        },
        {
            "name": "No Adverbs",
            "instruction": "Avoid adverbs ending in '-ly'.",
            "category": "avoidance",
        },
        {
            "name": "Short Words",
            "instruction": "Avoid words over three syllables.",
            "category": "avoidance",
        },
        {
            "name": "No Hedging",
            "instruction": "Avoid hedging words: maybe, perhaps, somewhat, slightly, probably, seems.",
            "category": "avoidance",
        },
    ]
    
    @classmethod
    def get_random_light_constraints(cls, count=2):
        """Return a random selection of light constraints from different categories."""
        all_pools = [
            cls.STRUCTURAL,
            cls.INCLUSION,
            cls.SENTENCE_LEVEL,
            cls.PERSPECTIVE,
            cls.AVOIDANCE,
        ]
        
        # Shuffle pools and pick from different categories
        random.shuffle(all_pools)
        selected = []
        
        for i, pool in enumerate(all_pools):
            if i >= count:
                break
            selected.append(random.choice(pool))
        
        return selected
    
    @classmethod
    def format_constraints(cls, constraints):
        """Format a list of light constraints for display."""
        if not constraints:
            return None
        
        names = [c["name"] for c in constraints]
        instructions = [f"• {c['instruction']}" for c in constraints]
        
        return {
            "name": "Light Constraints: " + ", ".join(names),
            "description": "Soft formal pressures to shape the writing without heavy restriction.",
            "instruction": "\n".join(instructions),
            "constraint_type": "light",
            "difficulty": "light",
            "parameters": {"constraints": [c["name"] for c in constraints]},
            "validator": None,
        }


# ============================================================================
# OULIPO CONSTRAINT BANK
# ============================================================================

class OuLiPoConstraints:
    """
    A bank of OuLiPo-derived writing constraints.
    Each constraint returns a dict with:
        - name: human-readable constraint name
        - description: explanation for process visibility
        - instruction: what the writer must do
        - validator: optional function to check compliance
        - difficulty: light, medium, or hard
    """
    
    VOWELS = set('aeiouAEIOU')
    # Prisoner's constraint: no letters with ascenders (b,d,f,h,k,l,t) 
    # or descenders (g,j,p,q,y)
    PRISONER_FORBIDDEN = set('bdfhkltgjpqyBDFHKLTGJPQY')
    
    # Difficulty tiers with word count ranges
    DIFFICULTY_TARGETS = {
        "light": (300, 500),
        "medium": (150, 300),
        "hard": (50, 150),
    }
    
    # Freewrite targets (no constraint)
    FREEWRITE_TARGETS = (300, 500)
    
    @classmethod
    def lipogram(cls, forbidden_letter=None):
        """Avoid a specific letter entirely."""
        if forbidden_letter is None:
            # Weight toward common letters for more difficulty
            weights = {'e': 10, 'a': 8, 't': 7, 'o': 6, 'i': 6, 'n': 5, 
                      's': 5, 'r': 4, 'h': 3, 'l': 3}
            letters = list(weights.keys())
            letter_weights = list(weights.values())
            forbidden_letter = random.choices(letters, weights=letter_weights)[0]
        
        return {
            "name": f"Lipogram (no '{forbidden_letter.upper()}')",
            "description": f"A lipogram avoiding the letter '{forbidden_letter}'. "
                          f"This constraint, famously used by Georges Perec in "
                          f"'La Disparition' (avoiding 'e'), forces lexical creativity.",
            "instruction": f"Write without using the letter '{forbidden_letter}' "
                          f"(uppercase or lowercase).",
            "constraint_type": "lipogram",
            "difficulty": "medium",
            "parameters": {"forbidden_letter": forbidden_letter},
            "validator": lambda text: forbidden_letter.lower() not in text.lower()
        }
    
    @classmethod
    def univocalic(cls, vowel=None):
        """Use only one vowel throughout."""
        if vowel is None:
            vowel = random.choice(['a', 'e', 'i', 'o', 'u'])
        
        forbidden_vowels = [v for v in 'aeiou' if v != vowel]
        
        return {
            "name": f"Univocalic (only '{vowel.upper()}')",
            "description": f"A univocalic poem uses only the vowel '{vowel}'. "
                          f"Christian Bök's 'Eunoia' dedicates chapters to each vowel.",
            "instruction": f"Write using only the vowel '{vowel}'. "
                          f"Avoid: {', '.join(forbidden_vowels)}.",
            "constraint_type": "univocalic",
            "difficulty": "hard",
            "parameters": {"vowel": vowel},
            "validator": lambda text: not any(v in text.lower() for v in forbidden_vowels)
        }
    
    @classmethod
    def prisoner_constraint(cls):
        """No ascenders or descenders—letters that could be seen over/under a wall."""
        return {
            "name": "Prisoner's Constraint",
            "description": "Use only letters without ascenders (b,d,f,h,k,l,t) or "
                          "descenders (g,j,p,q,y). As if passing notes under a door "
                          "with minimal vertical clearance.",
            "instruction": "Write using only: a, c, e, i, m, n, o, r, s, u, v, w, x, z. "
                          "Forbidden: b, d, f, g, h, j, k, l, p, q, t, y.",
            "constraint_type": "prisoner",
            "difficulty": "medium",
            "parameters": {},
            "validator": lambda text: not any(c in text for c in cls.PRISONER_FORBIDDEN)
        }
    
    @classmethod
    def snowball(cls, direction="growing"):
        """Words grow (or shrink) by one letter each."""
        if direction == "growing":
            return {
                "name": "Snowball (Growing)",
                "description": "Each successive word adds one letter. "
                              "A constraint emphasizing accumulation and momentum.",
                "instruction": "Start with a one-letter word, then two letters, "
                              "then three, and so on. Each word must be exactly "
                              "one letter longer than the previous.",
                "constraint_type": "snowball",
                "difficulty": "hard",
                "parameters": {"direction": "growing"},
                "validator": None  # Complex to validate automatically
            }
        else:
            return {
                "name": "Snowball (Melting)",
                "description": "Each successive word loses one letter. "
                              "A constraint emphasizing diminishment and entropy.",
                "instruction": "Start with a long word, then decrease by one letter "
                              "per word until you reach a single letter.",
                "constraint_type": "snowball",
                "difficulty": "hard",
                "parameters": {"direction": "melting"},
                "validator": None
            }
    
    @classmethod
    def n_plus_7(cls):
        """
        Replace nouns with the noun 7 entries later in the dictionary.
        Note: This is traditionally applied to existing text, but here
        we use it as a generative constraint.
        """
        return {
            "name": "N+7 (Conceptual)",
            "description": "The N+7 method replaces each noun with the noun "
                          "appearing seven entries later in a dictionary. "
                          "Here, apply conceptually: for each noun you want to use, "
                          "substitute a semantically distant noun.",
            "instruction": "Whenever you would naturally use a noun, replace it "
                          "with a noun from a completely different semantic field. "
                          "'Coffee' becomes 'glacier'; 'morning' becomes 'algorithm'.",
            "constraint_type": "n_plus_7",
            "difficulty": "light",
            "parameters": {},
            "validator": None
        }
    
    @classmethod
    def beautiful_outlaw(cls):
        """Only words that are 'beautiful'—subjective, personal constraint."""
        return {
            "name": "Beautiful Outlaw",
            "description": "Use only words you find aesthetically pleasing. "
                          "This constraint foregrounds the writer's idiosyncratic "
                          "relationship to language.",
            "instruction": "Before writing each word, ask: do I find this word "
                          "beautiful? If not, find another. Trust your ear.",
            "constraint_type": "beautiful_outlaw",
            "difficulty": "light",
            "parameters": {},
            "validator": None
        }
    
    @classmethod
    def monovocalic_sentence(cls):
        """Each sentence uses only one vowel, but vowels can change between sentences."""
        return {
            "name": "Monovocalic Sentences",
            "description": "Each sentence commits to a single vowel, but different "
                          "sentences may use different vowels. Rhythm through restriction.",
            "instruction": "Write sentences where each sentence uses only one vowel. "
                          "Sentence 1 might use only 'a', sentence 2 only 'o', etc.",
            "constraint_type": "monovocalic_sentence",
            "difficulty": "medium",
            "parameters": {},
            "validator": None
        }
    
    @classmethod
    def tautogram(cls, letter=None):
        """Every word begins with the same letter."""
        if letter is None:
            letter = random.choice('abcdefghijklmnoprstw')  # Avoid difficult letters
        
        return {
            "name": f"Tautogram ('{letter.upper()}')",
            "description": f"Every word begins with '{letter}'. An alliterative "
                          f"constraint that creates incantatory rhythm.",
            "instruction": f"Every word in your text must begin with the letter '{letter}'.",
            "constraint_type": "tautogram",
            "difficulty": "hard",
            "parameters": {"letter": letter},
            "validator": lambda text: all(
                word[0].lower() == letter.lower() 
                for word in re.findall(r'\b\w+', text)
            )
        }
    
    @classmethod
    def get_random_constraint(cls, difficulty=None):
        """Return a random constraint, optionally filtered by difficulty."""
        light = [
            cls.n_plus_7,
            cls.beautiful_outlaw,
        ]
        medium = [
            cls.lipogram,
            cls.prisoner_constraint,
            cls.monovocalic_sentence,
        ]
        hard = [
            cls.univocalic,
            lambda: cls.snowball(random.choice(["growing", "melting"])),
            cls.tautogram,
        ]
        
        if difficulty == "light":
            constraints = light
        elif difficulty == "medium":
            constraints = medium
        elif difficulty == "hard":
            constraints = hard
        else:
            constraints = light + medium + hard
        
        return random.choice(constraints)()
    
    @classmethod
    def get_word_target(cls, difficulty):
        """Get word count range for a difficulty level."""
        return cls.DIFFICULTY_TARGETS.get(difficulty, cls.FREEWRITE_TARGETS)


# ============================================================================
# PROMPT GENERATORS
# ============================================================================

class PromptBank:
    """
    Seed prompts for early-stage writing before corpus accumulates.
    Designed to be surrealist, open-ended, and productively strange.
    """
    
    PROMPTS = [
        "The last film you watched before sleeping—describe it as if it were a memory of something that happened to you.",
        "Write about a room you have never entered but have imagined entering many times.",
        "A machine that produces text. What does it smell like when it runs?",
        "The space between subtitles. What happens in the silence?",
        "Describe an act of editing as if it were an act of violence.",
        "You are reading a book that is also reading you. What does it learn?",
        "A grindhouse cinema at 4 AM. The projectionist has left. The film continues.",
        "Write about authorship as if it were a disease. What are the symptoms?",
        "The corridor between two drafts of the same sentence.",
        "Someone else's words in your mouth. How do they taste?",
        "A bibliography for a book that doesn't exist.",
        "The sound a constraint makes when it breaks.",
        "Write about surveillance from the perspective of the system doing the watching.",
        "A novel that cannot be finished because finishing would destroy it.",
        "The texture of a deleted scene.",
        "You discover your handwriting in a document you did not write.",
        "An algorithm dreams. What does it see?",
        "The weight of an unwritten sentence.",
        "Describe a process as if it were a landscape.",
        "A collaboration in which one party does not know they are collaborating.",
        "Write about a film using only sounds, no images.",
        "The marginal notes argue with the main text.",
        "A sentence that has been translated so many times it no longer resembles itself.",
        "The moment before a word becomes the wrong word.",
        "Write about transparency as if it were opaque.",
    ]
    
    @classmethod
    def get_random_prompt(cls):
        return random.choice(cls.PROMPTS)


class MarkovChain:
    """
    Variable-order Markov chain for text generation.
    Used to generate prompts from accumulated corpus.
    """
    
    def __init__(self, order=2):
        self.order = order
        self.chain = defaultdict(list)
        self.starts = []
    
    def train(self, text):
        """Train the model on a text."""
        words = text.split()
        if len(words) <= self.order:
            return
        
        for i in range(len(words) - self.order):
            state = tuple(words[i:i + self.order])
            next_word = words[i + self.order]
            self.chain[state].append(next_word)
            
            # Track sentence starters
            if i == 0 or words[i-1].endswith(('.', '!', '?')):
                self.starts.append(state)
    
    def train_from_directory(self, directory):
        """Train on all .md and .txt files in a directory."""
        path = Path(directory)
        if not path.exists():
            return False
        
        file_count = 0
        for ext in ['*.md', '*.txt']:
            for file in path.glob(ext):
                with open(file, 'r', encoding='utf-8') as f:
                    # Skip YAML front matter in markdown files
                    content = f.read()
                    if content.startswith('---'):
                        parts = content.split('---', 2)
                        if len(parts) >= 3:
                            content = parts[2]
                    self.train(content)
                    file_count += 1
        
        return file_count > 0
    
    def generate(self, max_words=30, seed_state=None):
        """Generate text from the trained model."""
        if not self.chain:
            return None
        
        if seed_state and seed_state in self.chain:
            state = seed_state
        elif self.starts:
            state = random.choice(self.starts)
        else:
            state = random.choice(list(self.chain.keys()))
        
        output = list(state)
        
        for _ in range(max_words - self.order):
            if state not in self.chain:
                break
            next_word = random.choice(self.chain[state])
            output.append(next_word)
            state = tuple(output[-self.order:])
        
        return ' '.join(output)


# ============================================================================
# EXQUISITE CORPSE
# ============================================================================

class ExquisiteCorpse:
    """
    Generate anchor fragments for blind writing.
    The writer sees Fragment A, writes to connect, then Fragment B is revealed.
    """
    
    def __init__(self, markov=None, prompt_bank=None):
        self.markov = markov
        self.prompt_bank = prompt_bank or PromptBank
    
    def generate_fragments(self, count=3, words_per_fragment=8):
        """Generate anchor fragments for Exquisite Corpse mode."""
        fragments = []
        
        for i in range(count):
            if self.markov and self.markov.chain:
                # Use Markov chain if corpus exists
                fragment = self.markov.generate(max_words=words_per_fragment)
            else:
                # Fall back to surrealist sentence fragments
                fragment = self._generate_surrealist_fragment()
            
            fragments.append({
                "index": i + 1,
                "text": fragment,
                "revealed": i == 0  # Only first fragment revealed initially
            })
        
        return fragments
    
    def _generate_surrealist_fragment(self):
        """Generate a surrealist sentence fragment without Markov."""
        subjects = [
            "The machine", "A corridor", "The editor", "Silent film", 
            "The last sentence", "An algorithm", "The margin", "A constraint",
            "The projectionist", "Your handwriting", "The subtitle",
            "A deleted scene", "The corpus", "An involuntary author"
        ]
        
        verbs = [
            "remembers", "erases", "transforms", "watches", "consumes",
            "generates", "forgets", "accumulates", "dissolves", "captures",
            "rejects", "multiplies", "translates", "corrupts", "reveals"
        ]
        
        objects = [
            "the silence between frames", "its own reflection", 
            "a text it cannot read", "the space before words",
            "an impossible film", "the weight of editing",
            "a constraint already broken", "the reader's participation",
            "someone else's memory", "the sound of processing",
            "a bibliography of ghosts", "the last vowel"
        ]
        
        return f"{random.choice(subjects)} {random.choice(verbs)} {random.choice(objects)}."


# ============================================================================
# JEKYLL OUTPUT
# ============================================================================

class JekyllOutput:
    """Generate Jekyll-compatible markdown files with YAML front matter."""
    
    @staticmethod
    def generate_filename(title=None):
        """Generate a Jekyll-compatible filename."""
        date = datetime.now().strftime('%Y-%m-%d')
        if title:
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            return f"{date}-{slug}.md"
        else:
            return f"{date}-writing-session.md"
    
    @staticmethod
    def generate_front_matter(title, constraint, word_target, tags=None):
        """Generate YAML front matter."""
        tags = tags or ["writing", "constraint", "process"]
        if constraint:
            tags.append(constraint["constraint_type"])
        
        front_matter = {
            "layout": "post",
            "title": title,
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S %z'),
            "categories": ["writing"],
            "tags": tags,
            "word_target": word_target,
            "constraint": constraint["name"] if constraint else None,
            "process_visible": True,
        }
        
        lines = ["---"]
        for key, value in front_matter.items():
            if isinstance(value, list):
                lines.append(f"{key}:")
                for item in value:
                    lines.append(f"  - {item}")
            elif value is not None:
                lines.append(f"{key}: {value}")
        lines.append("---")
        
        return '\n'.join(lines)
    
    @staticmethod
    def generate_template(prompt, constraint, word_target, exquisite_mode=False, 
                         fragments=None):
        """Generate a full markdown template for writing."""
        sections = []
        
        # Process visibility header
        sections.append("## Process Notes\n")
        sections.append(f"**Word Target:** {word_target} words\n")
        
        if constraint:
            sections.append(f"**Constraint:** {constraint['name']}\n")
            sections.append(f"> {constraint['description']}\n")
            sections.append(f"**Instruction:** {constraint['instruction']}\n")
        
        if exquisite_mode and fragments:
            sections.append("\n**Mode:** Exquisite Corpse\n")
            sections.append("Write between the revealed fragments. "
                          "Subsequent fragments will be revealed as you progress.\n")
        
        sections.append("\n---\n")
        
        # Prompt section
        sections.append("## Prompt\n")
        sections.append(f"> {prompt}\n")
        sections.append("\n---\n")
        
        # Writing section
        if exquisite_mode and fragments:
            sections.append("## Writing\n")
            for i, frag in enumerate(fragments):
                sections.append(f"### Fragment {frag['index']}\n")
                if frag['revealed']:
                    sections.append(f"**Anchor:** {frag['text']}\n")
                else:
                    sections.append("**Anchor:** [HIDDEN - reveal after completing previous section]\n")
                    # Include hidden text as HTML comment for later reveal
                    sections.append(f"<!-- HIDDEN: {frag['text']} -->\n")
                sections.append("\n[Your writing here]\n\n")
        else:
            sections.append("## Writing\n")
            sections.append("\n[Your writing here]\n")
        
        return '\n'.join(sections)


# ============================================================================
# MAIN ENGINE
# ============================================================================

class WritingEngine:
    """Main orchestrator for the writing tool."""
    
    def __init__(self, config=None):
        self.config = config or CONFIG
        self.constraints = OuLiPoConstraints
        self.prompt_bank = PromptBank
        self.markov = MarkovChain(order=self.config["markov_order"])
        self.exquisite = ExquisiteCorpse(self.markov, self.prompt_bank)
        self.jekyll = JekyllOutput
        
        # Try to train on existing corpus
        self.corpus_loaded = self.markov.train_from_directory(
            self.config["corpus_dir"]
        )
    
    def generate_session(self, mode="standard", constraint_type=None, 
                        difficulty=None, custom_prompt=None, title=None,
                        use_constraint=True, light_constraint_count=2):
        """
        Generate a complete writing session.
        
        Args:
            mode: "freewrite", "standard", "exquisite", or "custom"
            constraint_type: specific constraint or None for random
            difficulty: "light", "medium", "hard", or None for random
            custom_prompt: override random prompt
            title: optional post title
            use_constraint: if False, generate without constraint (pure freewrite)
            light_constraint_count: number of light constraints for freewrite (0-3)
        
        Returns:
            dict with session parameters and markdown content
        """
        # Handle freewrite mode
        if mode == "freewrite":
            if light_constraint_count > 0:
                light_constraints = LightConstraints.get_random_light_constraints(
                    count=light_constraint_count
                )
                constraint = LightConstraints.format_constraints(light_constraints)
            else:
                constraint = None
            min_words, max_words = self.constraints.FREEWRITE_TARGETS
        elif not use_constraint:
            constraint = None
            min_words, max_words = self.constraints.FREEWRITE_TARGETS
        else:
            # Select constraint
            if constraint_type:
                constraint_method = getattr(self.constraints, constraint_type, None)
                constraint = constraint_method() if constraint_method else \
                            self.constraints.get_random_constraint(difficulty)
            else:
                constraint = self.constraints.get_random_constraint(difficulty)
            
            # Get word target based on constraint difficulty
            actual_difficulty = constraint.get("difficulty", "medium")
            min_words, max_words = self.constraints.get_word_target(actual_difficulty)
        
        # Generate word target
        word_target = random.randint(min_words, max_words)
        
        # Generate prompt
        if custom_prompt:
            prompt = custom_prompt
        elif self.corpus_loaded and random.random() > 0.3:
            # 70% chance to use Markov prompt if corpus exists
            markov_prompt = self.markov.generate(max_words=20)
            if markov_prompt:
                prompt = f"Beginning with: \"{markov_prompt}\" — continue, diverge, or destroy."
            else:
                prompt = self.prompt_bank.get_random_prompt()
        else:
            prompt = self.prompt_bank.get_random_prompt()
        
        # Handle Exquisite Corpse mode
        fragments = None
        if mode == "exquisite":
            fragments = self.exquisite.generate_fragments(
                count=self.config["exquisite_corpse_fragments"]
            )
        
        # Generate title if not provided
        if not title:
            title = f"Writing Session: {datetime.now().strftime('%Y-%m-%d')}"
            if constraint:
                title += f" [{constraint['name']}]"
            elif mode == "freewrite":
                title += " [Freewrite]"
        
        # Generate markdown
        front_matter = self.jekyll.generate_front_matter(
            title, constraint, word_target
        )
        template = self.jekyll.generate_template(
            prompt, constraint, word_target, 
            exquisite_mode=(mode == "exquisite"),
            fragments=fragments
        )
        
        markdown = f"{front_matter}\n\n{template}"
        filename = self.jekyll.generate_filename(title)
        
        return {
            "filename": filename,
            "title": title,
            "constraint": constraint,
            "difficulty": constraint.get("difficulty") if constraint else None,
            "word_target": word_target,
            "prompt": prompt,
            "mode": mode,
            "fragments": fragments,
            "markdown": markdown,
            "corpus_active": self.corpus_loaded,
        }
    
    def ingest_post(self, filepath):
        """Add a completed post to the corpus."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract writing section (skip front matter and process notes)
            if "## Writing" in content:
                writing = content.split("## Writing")[1]
                # Remove HTML comments (hidden fragments)
                writing = re.sub(r'<!--.*?-->', '', writing, flags=re.DOTALL)
                # Remove placeholder text
                writing = writing.replace("[Your writing here]", "")
                writing = writing.strip()
                
                if writing and len(writing.split()) > 20:
                    self.markov.train(writing)
                    
                    # Save to corpus directory
                    corpus_path = Path(self.config["corpus_dir"])
                    corpus_path.mkdir(exist_ok=True)
                    
                    corpus_file = corpus_path / Path(filepath).name
                    with open(corpus_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    return True
        except Exception as e:
            print(f"Error ingesting post: {e}")
        
        return False
    
    def list_constraints(self):
        """List all available constraints."""
        constraints = [
            ("lipogram", "Avoid a specific letter"),
            ("univocalic", "Use only one vowel"),
            ("prisoner_constraint", "No ascenders or descenders"),
            ("snowball", "Words grow/shrink by one letter each"),
            ("n_plus_7", "Replace nouns with distant nouns"),
            ("beautiful_outlaw", "Only words you find beautiful"),
            ("monovocalic_sentence", "Each sentence uses one vowel"),
            ("tautogram", "Every word starts with same letter"),
        ]
        return constraints


# ============================================================================
# CLI INTERFACE
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="OuLiPo-inflected writing prompt generator with Markov augmentation"
    )
    
    parser.add_argument(
        "--mode", 
        choices=["standard", "exquisite"],
        default="standard",
        help="Writing mode: standard or exquisite corpse"
    )
    
    parser.add_argument(
        "--constraint",
        help="Specific constraint type (e.g., lipogram, univocalic)"
    )
    
    parser.add_argument(
        "--prompt",
        help="Custom prompt (overrides random generation)"
    )
    
    parser.add_argument(
        "--title",
        help="Post title"
    )
    
    parser.add_argument(
        "--output-dir",
        default="_posts",
        help="Output directory for generated posts"
    )
    
    parser.add_argument(
        "--corpus-dir",
        default="corpus",
        help="Directory containing corpus files"
    )
    
    parser.add_argument(
        "--min-words",
        type=int,
        default=200,
        help="Minimum word count target"
    )
    
    parser.add_argument(
        "--max-words",
        type=int,
        default=500,
        help="Maximum word count target"
    )
    
    parser.add_argument(
        "--ingest",
        help="Ingest a completed post into the corpus"
    )
    
    parser.add_argument(
        "--list-constraints",
        action="store_true",
        help="List available constraints"
    )
    
    parser.add_argument(
        "--print-only",
        action="store_true",
        help="Print to stdout instead of saving to file"
    )
    
    args = parser.parse_args()
    
    # Build config
    config = CONFIG.copy()
    config["corpus_dir"] = args.corpus_dir
    config["output_dir"] = args.output_dir
    config["word_count_range"] = (args.min_words, args.max_words)
    
    engine = WritingEngine(config)
    
    if args.list_constraints:
        print("\nAvailable Constraints:")
        print("-" * 50)
        for name, desc in engine.list_constraints():
            print(f"  {name}: {desc}")
        print()
        return
    
    if args.ingest:
        if engine.ingest_post(args.ingest):
            print(f"Successfully ingested: {args.ingest}")
        else:
            print(f"Failed to ingest: {args.ingest}")
        return
    
    # Generate session
    session = engine.generate_session(
        mode=args.mode,
        constraint_type=args.constraint,
        custom_prompt=args.prompt,
        title=args.title
    )
    
    if args.print_only:
        print(session["markdown"])
    else:
        # Save to file
        output_path = Path(args.output_dir)
        output_path.mkdir(exist_ok=True)
        
        filepath = output_path / session["filename"]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(session["markdown"])
        
        print(f"\n{'='*60}")
        print(f"WRITING SESSION GENERATED")
        print(f"{'='*60}")
        print(f"File: {filepath}")
        print(f"Title: {session['title']}")
        print(f"Mode: {session['mode']}")
        print(f"Word Target: {session['word_target']}")
        print(f"Constraint: {session['constraint']['name']}")
        print(f"Corpus Active: {session['corpus_active']}")
        print(f"{'='*60}")
        print(f"\nPrompt: {session['prompt']}")
        print(f"\nInstruction: {session['constraint']['instruction']}")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
