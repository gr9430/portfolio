---
layout: default
title: Visual Analysis
project: true
tags: [Interdisciplinary Teaching, Texts and Technology, Pedagogy, Visual Analysis, Interdisciplinary Teaching in Texts and Technology]
---

# Visual Analysis with AI
## _Toward Reading and Making New Media_

<iframe 
  src="https://glennritchey.net/phd/interdisciplinary-teaching/visual-analysis/" 
  width="100%" 
  height="900" 
  style="border: 1px solid #252825; border-radius: 4px;"
  loading="lazy"
  title="Visual Analysis with AI — Glenn Ritchey">
</iframe>

<p><a href="/phd/interdisciplinary-teaching/visual-analysis/assets/belfast-network.html" target="_blank">View this visualization in a new tab.</a></p>

# Reflection
My interest in this image analysis project stems from work I have done for years that is both personal and influenced my late-undergraduate work: murals in Belfast, No. Ireland, and how they communicate the attitudes between Irish Republican (anti-British Occupation/U.K. "membership") and British Loyalist/Unionist communities (anti-British Occupation/U.K. "membership"). The work I did on my undergraduate thesis was more concerned with "What do these images communicate not only about these dynamics, but when comparing specific depictions of Cú Chulainn (the hero ofthe Ulster cycle), what might we glean of values concerning masculine identity?".

When I took Dr. Sonia Stephen's Data Info Visualization course, my final project focused on taking images I captured from my iPhone in 2022 as accompanying illustrations to national survey data on attitudes concerning the divide and what paths forward are most desirable.

As many well know, we are experiencing a rampant uptick in far right wing sentiments in not just the United States but globally. Likewise, I was taken aback by some of the recent mural images that have been popping up in Loyalist communities as late:

![AI-generated loyalist mural example](/phd/interdisciplinary-teaching/visual-analysis/assets/ai-loyalist.png)
![AI-generated loyalist mural example](/phd/interdisciplinary-teaching/visual-analysis/assets/ai-loyalist-3.png)
![AI-generated loyalist mural example](/phd/interdisciplinary-teaching/visual-analysis/assets/ai-loyalist-4.png)
![AI-generated loyalist mural example](/phd/interdisciplinary-teaching/visual-analysis/assets/ai-loyalist-6.png)

The first reason is that they are vehemently racist in a way I have yet to see; this sentiment has always been implied based on my understanding of specific subtexts that inform the composition of murals. Regardless, they always have mostly focused on bolstering a sense of Loyalist/Unionist identity as a distinctive ethnic identity that is separate from the Irish, and therefore the partition of the northern six counties is justified. However, this round of AI-generated imagery specifically focuses on imagery evocative of the Crusades, as well as the idea that segregation or, more specifically, the denial of non-White immigrants to the North of Ireland is the only way to ensure a peaceful future.

The second is that these images are generated using AI. For this distinction to pop up amid the owner of a distinctively problematic, weaponized social media site working in tandem with Tommy Robinson, a far-right English agitator who focuses much of his efforts on the North, stoking a tremendous anti-immigration protest in Belfast, which has brought forth levels of property destruction that recalls the Troubles, or the period throughout the mid-to-late twentieth century where localized paramilitary warfar was at a height.

What I wish to demonstrate to students is how different analytical approaches from procedural to AI-assisted can be applied to visual analysis. My initial work here is focused on basic OpenCV protocols, where the second part uses Claude as an interactive analytical tool for interpretation and reasoning. Whereas OpenCV protocols will develop lackluster data points, Claude may help with a more involved sense of evaluating machine perception when working with images. However, what I wish to highlight is that as nice as it is to have Claude help with this sort of task, the capacity to interpret images remains a highly humanistic practice.

OpenCV returns a fixed, narrow set of measurements for every image regardless of content: brightness, blur score, dominant hex colors, edge-pixel density, contour count. These numbers are honest in the sense that they don't pretend to interpret anything, as a contour count of 103,000 on the Shankill's "Children Murdered" placard plainly communicates the image is visually dense. Likewise, it cannot tell you that the density is composed of children's faces, or that the placard is doing a specific kind of rhetorical work by refusing counter-argument through that density. The AI-assisted stage was deliberately staged in two passes for the same reason: I asked Claude first for raw visual description with interpretation explicitly withheld, and only afterward for cultural and rhetorical reading. The point of holding those two requests apart was to make the seam between description and interpretation visible to see what a system can name before it is asked to mean anything, and how much changes once it is.

These issues reflect a further development for this sort of project. Where I am currently limited is that I have no idea whether Republicans are using similar tactics of image generation on the Falls Road. However, I might suggest an educated guess on the basis that many of the murals on the Falls Road are still handpainted; in fact, this is a trade/craft practice that is a part of the community. As one will notice based on my images from 2022, the Shankill Road, Loyalist murals tended to have much more favoritism paid to the quick production of creating large placards. This favortisim toward quick production and the adoption of AI generated "murals" reflects such questions that are not immediately available to us, such as what specific models were used to generate these images (although, one can probably take a wild shot in the dark and hit the target). What I presume is the usage of a widely-used image generator with far less guard rails that is operated by the same social media proprietor. In short, I label this sort of concern as pedagogically valuable in developing media literacy given the ties that AI capabilities have to fascistic applications.

This staged method is also encoded in the network visualization itself in a way that performs a different kind of narration based more on quatification. Every mural on a given road is connected to every other mural on that road by a faint baseline edge. A claim that the murals share something prior to and beneath any specific interpretive connection, simply by virtue of standing on the same wall, in the same political tradition. Layered on top of that baseline are the bolder, more specific edges: shared subjects, shared placard formats, shared iconographic devices, and a small number of edges that cross between Falls and Shankill where a formal or thematic echo crosses the sectarian line. The visualization is therefore making a quiet argument of its own: cohesion exists at multiple depths, and the thin, dim connections are no less real for being less visually assertive than the thematic ones drawn over them.

My concern echoes historical concerns regarding technology applied to the arts serving fascistic ends, one might look no further than Walter Benjamin's work, "The Work of Art in the Age of Mechanical Reproduction." This connection is what I am thinking of when I mention the differences between the situated knowledge of the craftship of mural painting by hand in the Belfast community whose struggle is more aligned with traditionally decolonial or anticolonial actions, and the community who is more aligned with right-wing agitation. More specifically, what one recognizes is a distinct practice of image control at the manufacturing level which takes on an auratic quality versus a penchant for machine reproduction for the sake of expediting messaging distinct messages that, when decoded, reveal the ongoing desire to other.

# Assignment Overview

This assignment should take approximately two weeks of work inside and outside of class to complete (this will be split between in-class workshops and work completed outside of the classroom). The basic idea is to begin connecting your zine project to the impending New Media Exhibit by using Duck.ai (I recommend the most recent Claude model) as a collaborative analytical tool for visual interpretation in order to explore how images function as text. You will bring a corpus of images related to your zine's subject matter into conversation with the chatbot, moving through a structured sequence of prompts that produce increasingly developed analysis. At the end, you will reflect on the gap between what the chatbot sees and what you see and make that gap visible through a reflection artifact of your choosing.

The assignment has five phases. Complete them in order. Do not skip ahead.

__What you will produce__:
- A formalized image selection document (Phase 1)
- A saved conversation log through Duck.ai (Phases 2–4)
- A reflection artifact: either a hand-drawn Dear Data visualization or a D3 force-directed network (Phase 5)

__A note on chatbots__: Chatbots, like Claude, are large language models with vision capabilities. They can describe and interpret images but have no lived experience, no community membership, no embodied knowledge of the subjects they analyze. Your expertise, however partial or emergent, is situated in a way chatbots are not. This assignment is designed to make that difference legible. It is not meant to pit you against the machine but to help you understand what humanistic interpretation actually does that procedural analysis cannot.

---

## Phase 1: Image Selection & Prior Notes
### _Before you open Duck.ai_

__Due as a separate submission before the chatbot session.__

### Step 1: Select your corpus

Choose __10 images__ that meet all of the following criteria:

- They are images __you created__ (photographs, scans, screenshots) __or__ images that are __in the public domain__ and clearly documented as such
- They relate to a __media subject you are already researching__ for your zine or New Media Exhibit
- They form a __coherent set__ that share a subject, location, time period, formal quality, or thematic concern that makes comparison meaningful
- They are __saved as image files__ (JPEG, PNG, or HEIC) that you can upload to the chatbot.

Good corpus examples:
- 10 photographs you took of murals, signage, or public art in a specific neighborhood
- 10 archival photographs from a public domain collection related to your zine subject
- 10 screenshots of a social media visual phenomenon you are analyzing
- 10 images of album covers, film posters, or magazine covers from a specific era or genre

Poor corpus examples:
- 10 random images with no connecting thread
- Images you found on Google with unclear copyright status
- Images belonging to someone else that are not in the public domain

### Step 2: Write your prior notes

Before the chatbot sees your images, write your own observations. These notes are a formalized submission but they are not a draft to be revised. This submission should simply be an honest record of what you already know and notice.

For your corpus as a whole, write 150–200 words addressing:

- What is this set of images? What connects them?
- What do you already know about the subject matter, whether it be from research, lived experience, or prior coursework?
- What do you expect to find when you look closely at these images? What patterns, themes, or tensions do you anticipate?

Then, for __each of your 10 images__, write 2–3 sentences noting:

- What you see (purely descriptive)
- What you already know or suspect about this image that someone without your background might not

__Submit your prior notes document before proceeding to Phase 2__.

---

## Phase 2: Raw Visual Register
### _First chatbot session: description without interpretation_

Getting started: Go to duck.ai, select Claude (the most capable model for image analysis) from the model dropdown, and start a new chat. Then you will upload all 10 images at once if possible, or in numbered batches if the chatbot's upload limit requires it.

### Prompt 2A: Setting the frame

Copy and paste this prompt exactly as written:

> I am going to share a set of images with you. For now, I want only raw visual description with no interpretation, no cultural context, no inference about meaning. Describe only what is literally present: figures, text, colors, composition, objects, spatial relationships. Do not tell me what anything means or represents. Do not identify people by name. Do not reference historical events or cultural traditions. Just describe what you see as if you are a camera producing a text output. Confirm you understand this constraint before I share the images.

_Wait for the chatbot to confirm before uploading your images._

### Prompt 2B: Upload and describe

After the chatbot confirms, upload your images and send this prompt:

> Here are my 10 images. Please work through them one by one, numbered to match my uploads. For each image, provide: dimensions or orientation if visible, dominant colors, major visual elements, any text present, and spatial composition. Keep strictly to description. No interpretation.

### What to do with the output

Copy the full response and save it in a document labeled __Phase 2 Output__. Read it against your own prior notes from Phase 1. Do not respond to the chatbot yet.

---

## Phase 3: Developed Interpretation
### _Second chatbot session: analysis and cultural reading_

Continue in the same conversation. Duck.ai retains the conversation history within a single chat window, so the chatbot will still have access to your uploaded images and its own Phase 2 responses. You should not need to re-upload your images or re-explain what you're working on so long as you are working in the same browser. The chatbot's memory of your images within a conversation is important here.

### Prompt 3A: Lifting the constraint

Copy and paste this prompt exactly:

> Now I want you to shift modes. Move from description to interpretation. For each image, analyze what the visual elements are doing. Consider this rhetorically, culturally, politically, aesthetically. Consider: What is this image communicating and to whom? What compositional choices are being made and what do they suggest? What iconographic traditions or visual conventions is it drawing on? What does it assume the viewer already knows? Be as specific as possible. Draw on whatever cultural, historical, or media knowledge is relevant.

### Prompt 3B: Deepening specific images

After the chatbot responds, identify 3–5 images where you want more developed analysis. For each one, use this template:

> Look more closely at image [NUMBER]. You noted [QUOTE OR PARAPHRASE SOMETHING THE CHATBOT SAID]. I want you to develop this further. Specifically: [WRITE ONE FOCUSED QUESTION ABOUT SOMETHING THE CHATBOT MISSED, UNDERSTATED, OR GOT WRONG BASED ON YOUR OWN KNOWLEDGE].

_Repeat this prompt for each image you want to push on._

### Prompt 3C: Cross-corpus patterns

After the individual image follow-ups, send this prompt:

> Now step back from the individual images and look at the corpus as a whole. What patterns do you notice across the 10 images? What formal or thematic consistencies emerge? What tensions or contradictions exist within the set? What does this corpus, taken together, seem to be doing or saying?

### What to do with the output

Save the full exchange as __Phase 3 Output__. Now read Phases 2 and 3 together against your Phase 1 prior notes. Begin marking moments where the chatbot:

- noticed something you hadn't
- missed something you know
- described something accurately but interpreted it incorrectly or superficially
- had no access to knowledge that your background gives you

These marked moments are the raw material for Phase 4.

---

## Phase 4: Comparison & Gap Identification
### _Your analysis: where does the chatbot fall short?_

This phase happens outside the chatbot. It is your intellectual work.

### Step 1: Write a gap analysis

In 400–600 words, address the following:

- __What did the chatbot see well__ Identify 2–3 moments where the chatbot's analysis surprised you, extended your thinking, or accurately captured something you also noticed.
- __What did the chatbot miss or misread?__ Identify 2–3 moments where the chatbot's output revealed the limits of machine perception — where your situated knowledge, lived experience, disciplinary training, or community membership gave you access to meaning that the chatbot could not reach.
- __What does this tell you about interpretation?__ Reflect on what the comparison reveals about the difference between procedural description, AI-assisted interpretation, and humanistic close reading. You do not need to resolve this — you need to articulate the tension.

### Step 2: Identify your data

From your gap analysis, extract the specific observations, comparisons, and patterns you want to represent in your reflection artifact. These become your dataset for Phase 5.

Think about what is countable, rankable, or relational in what you found:
- How many images did the chatbot describe accurately versus misread?
- Which images generated the largest gap between your reading and the chatbot's?
- What categories of knowledge did the chatbot lack access to — iconographic, historical, community-specific, embodied?
- What formal properties (color, complexity, text density) correlated with better or worse chatbot output?

---

## Phase 5: Reflection Artifact
### _Choose one of the following two options_

---

### Option A: Dear Data Visualization

Inspired by the _Dear Data_ project by Giorgia Lupi and Stefanie Posavec, produce a __hand-drawn data visualization__ on paper (minimum A4/letter size) that represents the patterns you identified in your gap analysis.

Your visualization must:
- Be entirely hand-drawn — no digital tools for the artifact itself
- Include a __legend__ explaining your visual system
- Represent __at least three variables__ from your dataset (e.g., image number, gap size, category of missed knowledge)
- Include a __title__ and a __2–3 sentence caption__ explaining what the visualization shows and what it argues

You are not being graded on drawing ability. You are being graded on the clarity and intentionality of your visual system. A clear, well-reasoned visualization made with a ballpoint pen is better than a beautiful one that doesn't communicate anything.

__Why hand-drawn?__ The hand-drawn artifact enacts the argument you are making. If your project is about what machine perception cannot access, making the reflection artifact by hand — slowly, with your own body, encoding your own interpretive decisions — is not just a stylistic choice. It is a theoretical one.

__Submitting Option A:__
- Photograph or scan your artifact at high resolution
- Submit alongside your Phase 1 notes, Phase 2 output, Phase 3 output, and Phase 4 gap analysis

---

### Option B: D3 Force-Directed Network Visualization

Produce an interactive network visualization using D3.js that maps the relationships within your image corpus as revealed by the the chatbot analysis and your gap analysis.

This option requires comfort with HTML, JavaScript, and possibly Claude Code. If you have not used these tools before, choose Option A or speak with the instructor before beginning.

### Using the chatbot to build the visualization

Open a new conversation and use the following prompt sequence:

__Prompt 5B-1: Setting up the data structure:__

> I want to build a D3 force-directed network visualization of a corpus of [NUMBER] images I have analyzed. Each image will be a node. I want to encode the following variables as node properties: [LIST YOUR VARIABLES — e.g., image number, category, brightness, edge density, gap score from my analysis]. I want edges between nodes that share [LIST YOUR RELATIONSHIP CRITERIA — e.g., formal similarities, thematic connections, the same gap category]. Can you help me structure my data as a JavaScript array of node and edge objects?

__Prompt 5B-2: Building the visualization:__

> Now build a complete single-file HTML visualization using D3 v7 and a force-directed layout. Each node should be sized by [VARIABLE]. Node color should encode [VARIABLE]. Clicking a node should open a side panel showing the image's metadata, the AI analysis excerpt, and my own analysis excerpt. Include toggle controls to filter by [YOUR CATEGORIES]. Use a dark background. Make it self-contained with no external dependencies except the D3 CDN.

__Prompt 5B-3: Adding your analysis:__

> Here is my analysis data for each node. Please integrate it into the visualization so that clicking each node displays both the AI analysis and my human analysis, with a toggle between them: [PASTE YOUR FORMATTED DATA]

__What the visualization must include:__
- All 10 images represented as nodes
- At least two visual variables (size, color, or stroke) encoding meaningful data
- A clickable panel showing AI analysis and your analysis with a toggle
- A legend
- A brief written statement (150–200 words) explaining your design decisions and what the visualization argues

__Submitting Option B:__
- Submit the HTML file
- Submit alongside your Phase 1 notes, Phase 2 output, Phase 3 output, and Phase 4 gap analysis
- Note: publishing this visualization publicly is __optional__. Discuss with the instructor if you are interested in making your work public-facing.

---

## Evaluation Criteria

Your work will be evaluated across all five phases, not only the final artifact.

| Component | Weight | What we are looking for |
|---|---|---|
| Phase 1 — Image selection & prior notes | 20% | Coherence of corpus, specificity of prior knowledge, honesty of observation |
| Phases 2–3 — chatbot conversation | 20% | Quality of prompting, depth of follow-up, evidence of iterative engagement |
| Phase 4 — Gap analysis | 30% | Analytical precision, quality of reflection on machine vs. human interpretation |
| Phase 5 — Reflection artifact | 30% | Clarity of visual argument, intentionality of design, connection to gap analysis |

---

## A Note on AI Use

This assignment asks you to use the chatbot as a tool and as an object of study simultaneously. You are not using the chatbot to do your work for you but to produce output that you then analyze critically. The intellectual work of this assignment is yours: the selection of images, the prior notes, the gap analysis, and the reflection artifact. The chatbot produces raw material while you produce the argument. This is part and parcel with what we call "distant reading" (or viewing).

Save your full conversation with the chatbot. It is part of your submission.

---

## Timeline

| Phase | Due |
|---|---|
| Phase 1 — Image selection & prior notes | [DATE] |
| Phases 2–4 — chatbot conversation & gap analysis | [DATE] |
| Phase 5 — Reflection artifact | [DATE] |