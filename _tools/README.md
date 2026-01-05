# Writing Engine

An OuLiPo-inflected, Markov-augmented writing prompt tool designed for constrained daily practice with process visibility.

## Conceptual Framework

This tool synthesizes three approaches to generative writing:

1. **OuLiPo Constraints**: Formal restrictions (lipograms, univocalics, prisoner's constraint, etc.) that create productive pressure toward surrealist or unexpected language.

2. **Markov Chain Generation**: As you accumulate writing, the tool begins generating prompts from your own corpus—your language returned to you estranged.

3. **Exquisite Corpse Mechanics**: Optional mode where you write between revealed anchor fragments, with subsequent fragments hidden until you complete each section.

## Installation

```bash
# No external dependencies required for basic functionality
# Place files in your Jekyll site's _tools directory
chmod +x _tools/daily_write.sh
chmod +x _tools/interactive_session.py
```

## Usage

### Interactive Mode (Recommended)

```bash
./_tools/daily_write.sh
```

This launches an interactive menu:

```
╔════════════════════════════════════════════════════════════╗
║ DAILY WRITING SESSION                                      ║
╚════════════════════════════════════════════════════════════╝

  Corpus: Empty (ingest posts to build)

────────────────────────────────────────────────────────────

  [1] Freewrite
      Prompt only, no constraint. (300-500 words)

  [2] Constrained
      Prompt + OuLiPo constraint, scaled by difficulty.
      Light: 300-500 | Medium: 150-300 | Hard: 50-150

  [3] Exquisite Corpse
      Write between hidden anchor fragments.

  [4] Custom
      Choose your own parameters.

────────────────────────────────────────────────────────────

  [q] Quit
```

### Batch Mode (Non-interactive)

```bash
./_tools/daily_write.sh --batch
```

Generates a session file directly without the interactive interface.

### Direct Script Access

```bash
# List available constraints
python3 _tools/writing_engine.py --list-constraints

# Ingest a completed post into corpus
python3 _tools/writing_engine.py --ingest _posts/[your-post].md --corpus-dir _tools/corpus
```

## Writing Modes

### Freewrite
- Prompt only, no formal constraint
- 300-500 word target
- Best for: daily practice, warming up, generating raw material

### Constrained (with difficulty tiers)

| Difficulty | Constraints | Word Target |
|------------|-------------|-------------|
| Light | N+7, Beautiful Outlaw | 300-500 |
| Medium | Lipogram, Prisoner's, Monovocalic Sentences | 150-300 |
| Hard | Univocalic, Tautogram, Snowball | 50-150 |

Word targets scale to constraint difficulty—harder constraints get shorter targets.

### Exquisite Corpse
- Write between hidden anchor fragments
- Fragments revealed sequentially as you progress
- Optional: add a constraint layer on top

## Output Format

Generated files include:

1. **YAML Front Matter**: Jekyll-compatible metadata including constraint type, word target, and tags
2. **Process Notes**: Visible documentation of the constraint and its description
3. **Prompt**: The generative seed for writing
4. **Writing Section**: Template for your response

Example front matter:
```yaml
---
layout: post
title: "Writing Session: 2026-01-03 [Lipogram (no 'E')]"
date: 2026-01-03 14:30:00
categories:
  - writing
tags:
  - writing
  - constraint
  - process
  - lipogram
word_target: 347
constraint: Lipogram (no 'E')
process_visible: True
---
```

## Directory Structure

```
your-jekyll-site/
├── _posts/              # Generated writing sessions land here
├── _tools/              # Writing tool lives here (Jekyll ignores underscore dirs)
│   ├── writing_engine.py
│   ├── interactive_session.py
│   ├── daily_write.sh
│   ├── corpus/          # Ingested posts for Markov training
│   └── README.md
└── ...
```

## Corpus Accumulation

The tool starts with a bank of seed prompts and OuLiPo constraints. As you complete writing sessions and ingest them:

1. Early sessions: Pure constraint-based prompts from the seed bank
2. After accumulation: 70% chance of Markov-generated prompts from your corpus
3. Your own language begins seeding future writing

This creates a feedback loop where the tool becomes increasingly "you" over time.

## Exquisite Corpse Mode

In this mode, the tool generates multiple anchor fragments. You see only the first, write to extend it, then reveal the next. The goal is to write connective tissue between fragments you cannot anticipate.

Fragments are either:
- Markov-generated from your corpus (if available)
- Procedurally composed from surrealist sentence structures

Hidden fragments appear as HTML comments in the generated file, allowing you to reveal them manually as you progress.

## Jekyll Integration

Output files are designed for direct use with Jekyll:
- YAML front matter with appropriate metadata
- Category and tag structure
- Date-based filenames

Place `writing_engine.py` in your Jekyll site root and run from there, or specify `--output-dir` to target your `_posts` directory.

## Process Visibility

All constraints are documented in the output file, making the generative process visible to readers. This aligns with methodological transparency in experimental writing—the constraint is part of the work, not hidden infrastructure.

## Future Development

Potential extensions:
- Word count validation and feedback
- Constraint compliance checking (where automatically verifiable)
- Cross-contamination with external corpora (film subtitles, edited texts, etc.)
- Session streaks and progressive difficulty
- Integration with other Markov projects (Francosim, Recapitating Massive, All Night Run)
