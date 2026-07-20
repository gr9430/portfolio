---
layout: default
title: Textual Analysis
project: true
tags: [Interdisciplinary Teaching, Texts and Technology, Pedagogy, Textual Analysis, Interdisciplinary Teaching in Texts and Technology]
---
# Textual Analysis: Joyce's Dublin

A suite of interactive visualizations built as a demonstration of computational textual analysis for interdisciplinary humanities pedagogy. These visualizations are centered on James Joyce's spatial language in *Ulysses*, *The Portrait of the Artist as a Young Man*, and *Dubliners*, according to how he "once joked that if Dublin were to be destroyed by some catastrophe, it could be rebuilt brick by brick, using [_Ulysses_]" (<a href="https://ulysseseurope.eu/episode/dublin/">ULYSSES European Odyssey</a>).

These tools demonstrate how computational methods such as text mining, geographic visualization, and frequency analysis can open new angles of inquiry into canonical literary texts. Built for an assignment exploring data-driven approaches to close reading, they model how interdisciplinary digital humanities methods can be integrated into undergraduate humanities pedagogy.

## Visualizations

- [Joyce's Dublin — Spatial Atlas](joyce_dublin_map_final.html) — Interactive Leaflet map of every named Dublin location across Joyce's corpus, plotted geographically with frequency counts and interpretive notes

- [Spatial Footprint](joyce_spatial_footprint.html) — Comparative footprint of spatial references by work, showing how Joyce's geographic range shifts across texts

- [Spatial Vocabulary](joyce_spatial_vocabulary.html) — Frequency analysis of spatial and directional language throughout the corpus

- [Distinctive Spatial Vocabulary](joyce_distinctive_spatial.html) — Terms that are statistically distinctive to each text within Joyce's corpus, showing which spatial language each work most exclusively owns.

- [Place Concordance](joyce_place_concordance.html) — Full concordance of place-name occurrences across all three texts, sortable and filterable by work, with frequency counts color-coded by text

## Reflection

I conducted this week's work using Claude Projects to run a systematic spatial analysis of three Joyce texts, building a place-name concordance, analyzing spatial vocabulary across four categories (place names, direction and orientation, spatial urgency, and spatial prepositions), and mapping 131 verified Dublin locations onto an interactive cartographic visualization. The corpus was drawn entirely from Project Gutenberg texts in the public domain.

AI-assisted textual analysis excels at providing access to scale and evidence. A close reader of _Ulysses_ alone might intuit that Joyce's Dublin is unusually specific, but the concordance makes that specificity countable: 81 unique named locations, 131 total place mentions, a "through" rate in _Portrait_ of 14.9 per 10,000 words nearly double that of _Ulysses_. These are not claims a student could make without either a computational tool or an unrealistic investment of time. The analysis also surfaces cross-textual patterns that reading one work at a time structurally obscures. _Portrait_ having the smallest named-place footprint of the three texts and the highest rates of urgency, penetration, and aspiration in its spatial prepositions reframes the common claim that Joyce's Dublin is "total" or "complete" while pointing to the isolation Stephen expresses throughout the story. The concordance reflects how Joyce's spatial project is accumulative and differential rather than uniform. This claim depends on an understanding of the text from having read it and someone who attempts a distant reading before a close reading might not come to that conclusion--let alone appreciate it.

For students, this sort of work proposes a meaningful pathway into original research while working with publicly accessible, copyright-free texts, which removes the institutional barriers that often constrain undergraduate research. Moreover, it enables students to explore materials relevant to their interests that they might not otherwise encounter in a traditional classroom setting, including texts from non-Anglophone traditions, lesser-taught authors, or genre fiction that falls outside canonical syllabi. Asking students to select a text they are already familiar with and use computational tools to examine a specific formal or thematic aspect of it (spatial language, color terms, direct address, named characters) produces a first encounter with research methodology that is both reproducible and genuinely investigative.

The most instructive limitation this exercise surfaced was typographic. Claude's initial place-name extraction missed "Stephen's Green" because the Gutenberg file uses a curly apostrophe rather than a straight one, so the pattern-matching failed silently. Claude returned a result that looked reasonable and was wrong. Catching this error required knowing the text: knowing that Stephen's Green appears in all three texts, knowing that its absence from the output was suspicious. This is a major limitation of AI-assisted analysis we should all be familiar with, where the tool produces confident-looking outputs that require domain knowledge to evaluate. A student who does not know the texts they are analyzing cannot identify when the analysis has failed. AI, then, works best to extend what a reader already knows how to look for.

This connects to a broader issue about AI as a "reader." Claude does not read but pattern-matches against tokens which are only as useful as the queries that surface them. The spatial preposition analysis we conducted was productive because I knew which terms were theoretically relevant to a spatial argument. A student who asked Claude to "analyze Joyce for important themes" would get a confident, plausible, essentially useless summary. The quality of AI-assisted analysis is determined almost entirely by the quality of the analytical framework the human brings to it. This is not a bug but an argument for using these tools pedagogically. Students who learn to ask precise, theoretically grounded questions of a computational tool are learning the same skill that makes them better close readers.

I would design this exercise around a single public domain text relevant to the unit's theme, asking students to use Claude and/or Voyant, for those who prefer to avoid AI tools entirely, to build a concordance around a specific vocabulary cluster of their choosing. They would then write a short report (500–700 words) making one claim that the computational analysis supports, one claim it cannot support, and one question the analysis raises that would require close reading to answer. The three-part structure asks students to use the tool, evaluate its limits, and articulate what remains for interpretation; the focus would also privilege an analysis of affordances rather than solely focusing on traditional literary close readings.

Students would also be expected to iterate on the visual output by using Claude Skills (Claude's custom output styling and prompt-engineering tools) to customize the charts. The process of customizing an output requires understanding what is showing and why the output "looks that way," which is the critical literacy I hope to encourage. The spatial methodology practiced here carries directly into subsequent units — the same analytical vocabulary students develop reading Joyce translates to the zine project (mapping a fan domain) and the new media exhibit (reading platform interfaces as designed spatial environments).

What students would learn, ultimately, is that AI is a fast and often unreliable research assistant that requires an informed interlocutor. The productive use of these tools is not a replacement for knowing the texts — it is an amplification of that knowledge, available only to those who already have it.

---

[← Back to Course Overview](/phd/interdisciplinary-teaching/)
