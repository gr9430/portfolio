#!/usr/bin/env python3
"""
Interactive Writing Session
A terminal-based interface for constrained writing with live word count.
"""

import os
import sys
import subprocess
import tempfile
import re
from datetime import datetime
from pathlib import Path

# Add the script directory to path for importing
SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

from writing_engine import WritingEngine, CONFIG

# ============================================================================
# TERMINAL UTILITIES
# ============================================================================

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def get_terminal_width():
    try:
        return os.get_terminal_size().columns
    except:
        return 80

def box_print(text, width=None):
    """Print text in a box."""
    width = width or min(get_terminal_width() - 4, 60)
    print("╔" + "═" * width + "╗")
    for line in text.split('\n'):
        while len(line) > width - 2:
            print("║ " + line[:width-2] + " ║")
            line = line[width-2:]
        print("║ " + line.ljust(width - 2) + " ║")
    print("╚" + "═" * width + "╝")

def divider(char="─"):
    width = min(get_terminal_width(), 80)
    print(char * width)

def word_count(text):
    """Count words in text, excluding markdown formatting and placeholders."""
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            text = parts[2]
    
    text = re.sub(r'^#+\s+.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    text = text.replace('[Your writing here]', '')
    text = re.sub(r'\*+', '', text)
    text = re.sub(r'\*\*(Word Target|Constraint|Instruction|Mode|Anchor):\*\*', '', text)
    
    words = text.split()
    return len(words)

def extract_writing(text):
    """Extract just the writing section content."""
    if "## Writing" in text:
        writing = text.split("## Writing")[1]
        writing = re.sub(r'<!--.*?-->', '', writing, flags=re.DOTALL)
        writing = re.sub(r'^###?\s+.*$', '', writing, flags=re.MULTILINE)
        writing = re.sub(r'\*\*Anchor:\*\*.*$', '', writing, flags=re.MULTILINE)
        writing = writing.replace('[Your writing here]', '')
        writing = writing.replace('[HIDDEN - reveal after completing previous section]', '')
        return writing.strip()
    return text

# ============================================================================
# INTERACTIVE SESSION
# ============================================================================

class InteractiveSession:
    def __init__(self):
        self.config = CONFIG.copy()
        self.config["corpus_dir"] = str(SCRIPT_DIR / "corpus")
        self.config["output_dir"] = str(SCRIPT_DIR.parent / "_posts")
        self.engine = WritingEngine(self.config)
        self.session = None
        self.filepath = None
        
    def run(self):
        """Main entry point - show menu and handle selection."""
        while True:
            clear_screen()
            choice = self.show_main_menu()
            
            if choice == 'q':
                print("\nGoodbye.\n")
                return
            elif choice == '1':
                self.run_freewrite()
            elif choice == '2':
                self.run_constrained()
            elif choice == '3':
                self.run_exquisite()
            elif choice == '4':
                self.run_custom()
            
            # After session, ask to continue or quit
            print("\n[Enter] New session  |  [q] Quit")
            if input("> ").strip().lower() == 'q':
                return
    
    def show_main_menu(self):
        """Display main menu and get selection."""
        box_print("DAILY WRITING SESSION", width=60)
        print()
        
        corpus_status = "Active" if self.engine.corpus_loaded else "Empty (ingest posts to build)"
        print(f"  Corpus: {corpus_status}")
        print()
        divider()
        print()
        print("  [1] Freewrite")
        print("      Prompt + light formal constraints. (300-500 words)")
        print()
        print("  [2] Constrained")
        print("      Prompt + OuLiPo constraint, scaled by difficulty.")
        print("      Light: 300-500 | Medium: 150-300 | Hard: 50-150")
        print()
        print("  [3] Exquisite Corpse")
        print("      Write between hidden anchor fragments.")
        print()
        print("  [4] Custom")
        print("      Choose your own parameters.")
        print()
        divider()
        print()
        print("  [q] Quit")
        print()
        
        while True:
            choice = input("> ").strip().lower()
            if choice in ['1', '2', '3', '4', 'q']:
                return choice
            print("  Please enter 1, 2, 3, 4, or q")
    
    def run_freewrite(self):
        """Freewrite mode: prompt + light formal constraints."""
        clear_screen()
        box_print("FREEWRITE", width=60)
        print()
        print("  Light formal constraints to shape without restricting.")
        print()
        print("  How many light constraints?")
        print()
        print("  [0] None (pure freewrite)")
        print("  [1] One constraint")
        print("  [2] Two constraints (default)")
        print("  [3] Three constraints")
        print()
        print("  [b] Back to menu")
        print()
        
        while True:
            choice = input("> ").strip().lower()
            if choice == 'b':
                return
            elif choice in ['', '2']:
                count = 2
                break
            elif choice in ['0', '1', '3']:
                count = int(choice)
                break
            print("  Please enter 0, 1, 2, 3, or b")
        
        clear_screen()
        self.session = self.engine.generate_session(
            mode="freewrite", 
            light_constraint_count=count
        )
        self.show_session_info()
        
        if self.confirm_or_regenerate(mode="freewrite", light_constraint_count=count):
            self.save_session()
            self.writing_loop()
    
    def run_constrained(self):
        """Constrained mode with difficulty selection."""
        clear_screen()
        box_print("CONSTRAINED MODE", width=60)
        print()
        print("  Select difficulty:")
        print()
        print("  [1] Light   - N+7, Beautiful Outlaw (300-500 words)")
        print("  [2] Medium  - Lipogram, Prisoner's, Monovocalic (150-300 words)")
        print("  [3] Hard    - Univocalic, Tautogram, Snowball (50-150 words)")
        print("  [r] Random  - Any constraint, scaled appropriately")
        print()
        print("  [b] Back to menu")
        print()
        
        while True:
            choice = input("> ").strip().lower()
            if choice == 'b':
                return
            elif choice == '1':
                difficulty = "light"
                break
            elif choice == '2':
                difficulty = "medium"
                break
            elif choice == '3':
                difficulty = "hard"
                break
            elif choice == 'r':
                difficulty = None
                break
            print("  Please enter 1, 2, 3, r, or b")
        
        clear_screen()
        self.session = self.engine.generate_session(mode="standard", difficulty=difficulty)
        self.show_session_info()
        
        if self.confirm_or_regenerate(mode="standard", difficulty=difficulty):
            self.save_session()
            self.writing_loop()
    
    def run_exquisite(self):
        """Exquisite Corpse mode with optional constraint."""
        clear_screen()
        box_print("EXQUISITE CORPSE", width=60)
        print()
        print("  Write between hidden anchor fragments.")
        print()
        print("  Add a constraint?")
        print()
        print("  [1] No constraint (freewrite between fragments)")
        print("  [2] Light constraint")
        print("  [3] Medium constraint")
        print("  [4] Hard constraint")
        print()
        print("  [b] Back to menu")
        print()
        
        while True:
            choice = input("> ").strip().lower()
            if choice == 'b':
                return
            elif choice == '1':
                use_constraint = False
                difficulty = None
                break
            elif choice == '2':
                use_constraint = True
                difficulty = "light"
                break
            elif choice == '3':
                use_constraint = True
                difficulty = "medium"
                break
            elif choice == '4':
                use_constraint = True
                difficulty = "hard"
                break
            print("  Please enter 1, 2, 3, 4, or b")
        
        clear_screen()
        self.session = self.engine.generate_session(
            mode="exquisite", 
            difficulty=difficulty,
            use_constraint=use_constraint
        )
        self.show_session_info()
        
        if self.confirm_or_regenerate(mode="exquisite", difficulty=difficulty, use_constraint=use_constraint):
            self.save_session()
            self.writing_loop()
    
    def run_custom(self):
        """Custom mode: full control over parameters."""
        clear_screen()
        box_print("CUSTOM SESSION", width=60)
        print()
        
        # Constraint selection
        print("  Constraint:")
        print()
        print("  [0] None (freewrite)")
        print("  [1] Lipogram (avoid a letter)")
        print("  [2] Univocalic (one vowel only)")
        print("  [3] Prisoner's Constraint (no ascenders/descenders)")
        print("  [4] Snowball (words grow/shrink)")
        print("  [5] N+7 (substitute distant nouns)")
        print("  [6] Beautiful Outlaw (only beautiful words)")
        print("  [7] Monovocalic Sentences")
        print("  [8] Tautogram (all words start with same letter)")
        print("  [r] Random")
        print()
        
        constraint_map = {
            '0': None,
            '1': 'lipogram',
            '2': 'univocalic',
            '3': 'prisoner_constraint',
            '4': 'snowball',
            '5': 'n_plus_7',
            '6': 'beautiful_outlaw',
            '7': 'monovocalic_sentence',
            '8': 'tautogram',
            'r': 'random',
        }
        
        while True:
            choice = input("  Constraint > ").strip().lower()
            if choice in constraint_map:
                constraint_choice = constraint_map[choice]
                break
            print("  Please enter 0-8 or r")
        
        # Word count
        print()
        print("  Word target (or press Enter for default):")
        word_input = input("  Words > ").strip()
        
        if word_input.isdigit():
            word_target = int(word_input)
        else:
            word_target = None  # Will use default based on constraint
        
        # Exquisite mode?
        print()
        print("  Use Exquisite Corpse fragments? [y/N]")
        exquisite = input("  > ").strip().lower() == 'y'
        
        # Custom prompt?
        print()
        print("  Custom prompt? (Enter to use random, or type prompt)")
        custom_prompt = input("  > ").strip()
        if not custom_prompt:
            custom_prompt = None
        
        # Generate session
        clear_screen()
        
        mode = "exquisite" if exquisite else ("freewrite" if constraint_choice is None else "standard")
        use_constraint = constraint_choice is not None
        constraint_type = None if constraint_choice in [None, 'random'] else constraint_choice
        
        self.session = self.engine.generate_session(
            mode=mode,
            constraint_type=constraint_type,
            use_constraint=use_constraint,
            custom_prompt=custom_prompt,
        )
        
        # Override word target if specified
        if word_target:
            self.session['word_target'] = word_target
        
        self.show_session_info()
        
        if self.confirm_or_regenerate(mode=mode, use_constraint=use_constraint):
            self.save_session()
            self.writing_loop()
    
    def show_session_info(self):
        """Display session parameters."""
        s = self.session
        
        mode_display = s['mode'].upper()
        if s['mode'] == 'freewrite':
            mode_display = "FREEWRITE"
        elif s['mode'] == 'exquisite':
            mode_display = "EXQUISITE CORPSE"
        elif s['constraint']:
            mode_display = f"CONSTRAINED ({s['difficulty'].upper()})" if s.get('difficulty') else "CONSTRAINED"
        
        print(f"{'MODE:':<12} {mode_display}")
        print(f"{'TARGET:':<12} {s['word_target']} words")
        print(f"{'CORPUS:':<12} {'Active' if s['corpus_active'] else 'Empty'}")
        
        divider()
        print()
        
        if s['constraint']:
            print("CONSTRAINT:")
            print(f"  {s['constraint']['name']}")
            print()
            print(f"  {s['constraint']['description']}")
            print()
            print("INSTRUCTION:")
            print(f"  {s['constraint']['instruction']}")
            divider()
            print()
        
        print("PROMPT:")
        # Word wrap the prompt
        prompt = s['prompt']
        width = min(get_terminal_width() - 4, 76)
        words = prompt.split()
        lines = []
        current_line = "  "
        for word in words:
            if len(current_line) + len(word) + 1 > width:
                lines.append(current_line)
                current_line = "  " + word
            else:
                current_line += " " + word if current_line != "  " else word
        lines.append(current_line)
        print('\n'.join(lines))
        
        if s['mode'] == 'exquisite' and s['fragments']:
            divider()
            print()
            print("FRAGMENTS:")
            for frag in s['fragments']:
                if frag['revealed']:
                    print(f"  {frag['index']}: {frag['text']}")
                else:
                    print(f"  {frag['index']}: [HIDDEN]")
        
        divider()
    
    def confirm_or_regenerate(self, **kwargs):
        """Ask user to confirm or regenerate session."""
        print()
        print("[Enter] Accept and write  |  [r] Regenerate  |  [b] Back to menu")
        
        while True:
            choice = input("> ").strip().lower()
            
            if choice == '' or choice == 'y':
                return True
            elif choice == 'r':
                clear_screen()
                # Regenerate with same parameters
                mode = kwargs.get('mode', 'standard')
                difficulty = kwargs.get('difficulty')
                use_constraint = kwargs.get('use_constraint', True)
                light_constraint_count = kwargs.get('light_constraint_count', 2)
                
                if mode == "freewrite":
                    self.session = self.engine.generate_session(
                        mode=mode,
                        light_constraint_count=light_constraint_count
                    )
                else:
                    self.session = self.engine.generate_session(
                        mode=mode,
                        difficulty=difficulty,
                        use_constraint=use_constraint
                    )
                self.show_session_info()
                print()
                print("[Enter] Accept and write  |  [r] Regenerate  |  [b] Back to menu")
            elif choice == 'b':
                return False
    
    def save_session(self):
        """Save the session to a markdown file."""
        output_path = Path(self.config["output_dir"])
        output_path.mkdir(exist_ok=True)
        
        self.filepath = output_path / self.session["filename"]
        with open(self.filepath, 'w', encoding='utf-8') as f:
            f.write(self.session["markdown"])
    
    def writing_loop(self):
        """Main writing loop with word count display."""
        clear_screen()
        
        s = self.session
        editor = os.environ.get('EDITOR', 'nano')
        
        print()
        if s['constraint']:
            box_print(f"WRITING: {s['constraint']['name']}", width=60)
        else:
            box_print("FREEWRITE", width=60)
        print()
        print(f"TARGET: {s['word_target']} words")
        print(f"FILE: {self.filepath}")
        print()
        
        # Show prompt (word wrapped)
        print("PROMPT:")
        prompt = s['prompt']
        width = min(get_terminal_width() - 4, 76)
        words = prompt.split()
        lines = []
        current_line = "  "
        for word in words:
            if len(current_line) + len(word) + 1 > width:
                lines.append(current_line)
                current_line = "  " + word
            else:
                current_line += " " + word if current_line != "  " else word
        lines.append(current_line)
        print('\n'.join(lines))
        print()
        
        if s['constraint']:
            print(f"INSTRUCTION: {s['constraint']['instruction']}")
            print()
        
        if s['mode'] == 'exquisite' and s['fragments']:
            print(f"FRAGMENT 1: {s['fragments'][0]['text']}")
            print("(Other fragments hidden in file as HTML comments)")
            print()
        
        divider()
        print()
        print(f"Opening in {editor}...")
        print("Save and exit when finished.")
        print()
        input("[Press Enter to open editor]")
        
        # Open in editor
        subprocess.run([editor, str(self.filepath)])
        
        # Check word count
        self.show_results()
    
    def show_results(self):
        """Display results after writing."""
        clear_screen()
        
        with open(self.filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        writing = extract_writing(content)
        count = len(writing.split()) if writing else 0
        target = self.session['word_target']
        
        print()
        box_print("SESSION COMPLETE", width=60)
        print()
        
        # Word count display
        if count >= target:
            status = "✓ TARGET MET"
            bar_char = "█"
        else:
            status = "○ BELOW TARGET"
            bar_char = "▓"
        
        # Progress bar
        bar_width = 40
        pct = count / target if target > 0 else 0
        filled = min(int(pct * bar_width), bar_width)
        bar = bar_char * filled + "░" * (bar_width - filled)
        
        print(f"WORDS WRITTEN: {count}")
        print(f"TARGET:        {target}")
        print(f"STATUS:        {status}")
        print()
        print(f"[{bar}] {int(pct * 100)}%")
        
        divider()
        print()
        
        # Preview of writing
        if writing and len(writing) > 0:
            preview = writing[:300] + "..." if len(writing) > 300 else writing
            print("PREVIEW:")
            print()
            for line in preview.split('\n')[:8]:
                print(f"  {line[:75]}")
            print()
        
        divider()
        print()
        
        # Ingest option
        print("Add this writing to your corpus for future Markov prompts?")
        print("[y] Yes, ingest  |  [n] No, skip  |  [d] Delete session file")
        
        while True:
            choice = input("> ").strip().lower()
            
            if choice == 'y':
                if self.engine.ingest_post(str(self.filepath)):
                    print(f"\n✓ Ingested into corpus.")
                else:
                    print(f"\n✗ Ingestion failed (maybe not enough words).")
                break
            elif choice == 'n' or choice == '':
                print(f"\nFile saved: {self.filepath}")
                break
            elif choice == 'd':
                confirm = input("Delete session file? [y/N] ").strip().lower()
                if confirm == 'y':
                    os.remove(self.filepath)
                    print("\nSession file deleted.")
                else:
                    print(f"\nFile kept: {self.filepath}")
                break


# ============================================================================
# MAIN
# ============================================================================

def main():
    # Handle legacy command line arguments for backward compatibility
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ["help", "-h", "--help"]:
            print("Usage: ./interactive_session.py")
            print()
            print("Launches interactive menu for daily writing sessions.")
            print()
            print("Modes available in menu:")
            print("  Freewrite   - Prompt only, no constraint")
            print("  Constrained - Prompt + OuLiPo constraint (light/medium/hard)")
            print("  Exquisite   - Write between hidden fragments")
            print("  Custom      - Full control over all parameters")
            print()
            return
    
    session = InteractiveSession()
    session.run()


if __name__ == "__main__":
    main()
