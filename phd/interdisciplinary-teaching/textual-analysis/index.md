# Textual Analysis

In this first major assignment, students will work with our assigned text, [*Alice's Adventures Under Ground*](https://www.gutenberg.org/ebooks/19002), and use computational methods like concordance-building, frequency analysis, and pattern extraction, to open a new angle of their original inquiry into it. This assignment concerns the analytical and evidentiary vocabulary the rest of the semester builds on: how form, pattern, and evidence produce meaning, and how a claim about a text is distinct from a hunch about one.

## Project Overview

Students will work with [*Alice's Adventures Under Ground*](https://www.gutenberg.org/ebooks/19002), Lewis Carroll's original 1862–63 manuscript he illustrated himself, later expanded and had professionally illustrated as the published *Alice's Adventures in Wonderland*. Working from a shared, freely accessible public-domain text keeps every student's analysis grounded in the same evidentiary base, while sidestepping the institutional copyright constraints that often limit what undergraduates can do with a text computationally. Within *Under Ground*, each student selects a specific aspect — spatial or scale language (the story is, after all, largely about growing and shrinking), color terms, direct address, named characters, or another category they can defend as theoretically relevant — as their own analytical throughline.

Before any concordance work begins, students run their copy of the text through a [Text Cleaner](https://glennritchey.net/tools/txtclnr) — a deterministic, non-AI tool built specifically for preparing Project Gutenberg texts for computational analysis. It exposes every cleaning step as an inspectable, toggleable rule, organized in stages (Repair, Reflow, Normalize, Flatten), rather than performing an invisible one-shot conversion. Students choose which rules to apply and must be able to justify those choices: several of the later-stage rules are explicitly destructive — removing stop words, for instance, deletes every negation and hedge in the text, which matters enormously if a student's vocabulary cluster involves denial, uncertainty, or direct address. This step happens entirely in the browser through deterministic rules; getting it right is a matter of editorial judgment, not AI reliability, and it is worth being explicit with students that this stage carries no AI risk at all.

Working with Claude and/or Voyant Tools (for students who prefer to avoid AI tools entirely), students will build a concordance around a specific vocabulary cluster of their own choosing; be it spatial language, color terms, direct address, named characters, or another category they can defend as theoretically relevant to their reading of the text. The computational tools students will encounter provide scale: a close reader might sense that a text's use of a particular kind of language is unusual, but a concordance makes that sense countable and comparable.

Students then iterate on the visual presentation of their data — using Claude Artifacts, Voyant Tools' own built-in visualization exports, or a hand-drawn or manually composed visualization, in the spirit of [*Dear Data*](https://www.dear-data.com/theproject), to customize how the concordance or frequency analysis is displayed. Understanding what a visualization is showing, and why it looks the way it does, is itself part of the assignment's critical literacy.

The instructor's own example of a concordance and set of spatial visualizations built across *Ulysses*, *Portrait*, and *Dubliners* will be presented to the class as a modeled example of the method. It does not overlap with the assigned text but demonstrates how to define a vocabulary cluster, build a concordance, and read the resulting data against close reading. That way, students can see the method applied to one text before adapting it to their own analytical questions about *Under Ground*.

This assignment develops the analytical and evidentiary vocabulary students carry forward through the rest of the semester. This will become more apparent as we work through the Visual Analysis assignment where students will turn evidentiary instinct toward photographed images by translating what a computational reduction extracts into vocabulary for a Tracery grammar. The Zine project then draws on the resulting grammar to generate and curate a made object. The New Media Exhibit will close the sequence, asking the same evidentiary instincts (i.e., knowing what you can claim and what you can't) to inform the design of a remediated, interactive artifact.

This is all to say that these skills will continue to build atop each other throughout the semester so students may demonstrate critical analytical skills and then critical making skills.

## Scaffolding

Students are not expected to arrive with computational or coding experience. The assignment is scaffolded through:

- **Text cleaning**, using the instructor-built Text Cleaner tool before any AI or concordance work begins. Its rules are staged and explained in plain language, so students can see exactly what each one does and why it's ordered where it is, and make an informed choice about which to apply.

- **In-class modeling**, using the instructor's ["Joyce's Dublin" project](https://glennritchey.net/phd/interdisciplinary-teaching/textual-analysis/example/) to walk through the method live — building a concordance category, running a frequency comparison, and narrating the reasoning behind each analytical choice — before students attempt the same process on *Under Ground*.

- **Tool choice**, with Claude available for students comfortable with AI-assisted analysis and Voyant Tools offered as a no-AI alternative that performs comparable frequency and concordance functions.

- **Visualization**, with three paths available:

    - Claude Artifacts for students customizing their output with AI assistance
    - Voyant Tools' own built-in visualization exports (word clouds, trend graphs, distribution charts) as the corresponding no-AI alternative for students already working in Voyant
    - or a hand-drawn or manually composed visualization (using GIMP, Photoshop, or physical media) in the spirit of Giorgia Lupi and Stefanie Posavec's *Dear Data* — a reminder that translating data into a visual form is an interpretive, authorial act regardless of which tool renders it.

All three paths get in-class time to iterate on formatting and design choices with instructor support.

## Learning Objectives

Students completing the Textual Analysis assignment will:

- Use computational methods (concordance-building, frequency analysis) to identify patterns in a literary text that would be difficult or impractical to establish through close reading alone

- Distinguish claims a computational analysis can support and claims that require close reading and domain knowledge to make

- Evaluate machine-mediated analytical output critically, including identifying moments where the tool's pattern-matching produces plausible-looking but interpretively incorrect results

- Recognize preprocessing (text cleaning) as an editorial decision rather than a neutral technical step, and justify which cleaning rules were applied to a source text and which were deliberately left off

- Design a theoretically motivated analytical framework (knowing what to look for and why) rather than asking a tool to find "important themes" in the abstract

- Customize a data visualization and account for the interpretive choices embedded in its design

## AI Protocol

This assignment was designed with AI in mind from the outset, since the concordance-building method itself depends on it (or on a comparable tool like Voyant). Text cleaning is a separate, prior stage handled by a deterministic tool and carries no AI risk; the protocol below concerns only the concordance and analysis work that happens after a student's text has already been cleaned.

**What AI can do:** Claude can build a place-name or vocabulary concordance, compute frequency counts across categories, and surface cross-textual or cross-chapter patterns that reading one section at a time can obscure. It can also assist in generating and customizing visualizations of the resulting data. This is where AI-assisted analysis genuinely extends what a single reader can do — not by reading the text, but by making its patterns countable.

**The requirement:** Students must include a process log documenting their exchanges with Claude (or their process in Voyant), and must identify at least one specific moment where the tool's output needed to be checked against their own knowledge of the text — a place where a term was miscategorized, an ambiguous or figurative usage was counted as if literal, or a pattern reported as significant turned out, on inspection, not to be. Because text cleaning is handled separately and deterministically, this catch should come from the analytical stage itself: the tool proposing a reading of the data that only a reader who already knows *Under Ground* would recognize as wrong. This is not a hypothetical: it is what happens in practice, and the log should show the student catching it.

**What AI cannot do:** The interpretive claims in the final report are the student's own. Claude does not read; it pattern-matches against tokens, and the output is only as useful as the question the student brought to it. A vague prompt ("what are the important themes in this text?") will return a confident, plausible, and largely useless summary — and a student who submits that without noticing is demonstrating exactly the failure mode this assignment is designed to teach against.

**Why this policy:** AI-assisted textual analysis is not a substitute for knowing a text but an amplification of that knowledge, available only to a reader who already has some. Students who learn to ask precise, theoretically grounded questions of a computational tool are practicing the same skill that makes them better close readers.

## Deliverables

- A brief note on which Text Cleaner rules were applied (or deliberately left off), particularly any destructive Flatten-stage rules, and why

- A concordance or frequency dataset built around a student-chosen vocabulary cluster

- A customized visualization of that data (via Claude Artifacts, Voyant's built-in visualization tools, or a hand-drawn/manually composed piece in the spirit of *Dear Data*)

- A process log documenting AI (or Voyant) use, including at least one identified error or limitation

- A short report (500–700 words) with three required components: one claim the computational analysis supports, one claim it cannot support, and one question the analysis raises that only close reading could answer

## Assessment

The assignment is assessed across four dimensions:

- **Analytical framework (25 points)** — Is the vocabulary cluster or category scheme theoretically motivated? Does the student demonstrate they knew what to look for, and why it mattered for this text? Are the Text Cleaner rule choices justified, especially any destructive ones?

- **Evidentiary claim (30 points)** — Does the report's three-part structure hold up: a claim genuinely supported by the data, a claim honestly identified as unsupportable by the data alone, and a question that meaningfully requires close reading rather than restating the first two points?

- **Process log (25 points)** — Does the log document specific exchanges rather than a general summary of "using AI"? Does it identify a concrete moment where the tool's output required verification, and explain how the student caught it?

- **Visualization and presentation (20 points)** — Is the customized visual output legible and well-formed? Does the student account for the design decisions that shaped how the data is presented?