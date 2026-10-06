/* Act IV — Indie game — presented by Anastasia Salter. Outline: "is there human agency in agentic AI?" */
(function (root) {
  'use strict';
  const ACT4_SCENES = [
    {
      id: 'a4-act', act: 4, minutes: 0.5, layout: 'statement', room: 'workshop', agency: 1,
      heading: 'Act IV: Is There Human Agency in Agentic AI?',
      text: 'Material · tools · time · steps',
      fx: ['iris-in'], say: 'You wake up in a workshop. There is an agent here.',
      notes: 'Anastasia returns. A game act, because games are where we think about agency most directly.',
    },
    {
      id: 'a4-triad', act: 4, minutes: 1, layout: 'statement', room: 'workshop', agency: 1,
      heading: 'Material, tools, time… and steps',
      text: 'Nowviskie’s triad (pp. 11–12), plus a fourth loss: control over the steps and decisions themselves, sold as convenience.',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'Bethany Nowviskie’s triad as we use it in the book. Agents add a fourth thing we can lose.',
    },
    {
      id: 'a4-contribution', act: 4, minutes: 1, layout: 'statement', room: 'workshop', agency: 0,
      text: 'If my agent does all the work to create a website, a Tracery bot, a 3D print file, where is the human contribution? When does lowering barriers remove the point of making?',
      fx: ['iris-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The honest worry. Watch the agency meter hit zero.',
    },
    {
      id: 'a4-pun', act: 4, minutes: 1, layout: 'statement', room: 'workshop', agency: 0,
      heading: 'The pun is the argument',
      text: 'Making restores human agency. Agentic AI transfers it to the system.',
      fx: ['pixel-dissolve'],
      notes: 'The title’s pun: agency, and agentic.',
    },
    {
      id: 'a4-unmake', act: 4, minutes: 1, layout: 'choice', room: 'office', agency: 2,
      heading: 'Can we unmake the agent?',
      text: 'A critical maker… (p. 10)',
      choices: ['Reject the tool', 'Supplement the tool', 'Extend the tool', 'Critique the tool'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'Each press reveals one option, like a dialogue menu. From the book: a critical maker rejects, supplements, extends, and critiques the tool. All four, not one.',
    },
    {
      id: 'a4-ask', act: 4, minutes: 1.25, layout: 'choice', room: 'office', agency: 3,
      heading: 'Ask of any agent:',
      choices: ['What did it plan?', 'Which tools did it call?', 'Which sources did it choose?', 'What did it skip?', 'Where would a human have chosen differently?'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'The inspection pattern from Act III, made concrete. These questions work for students, for reviewers, and for us. Reveal one per press.',
    },
    {
      id: 'a4-defaults', act: 4, minutes: 1, layout: 'gallery', room: 'commons', agency: 2,
      heading: 'Whose defaults?',
      text: 'Ask an image model for a “professor of digital culture” and see who it imagines. We built our guides by hand.',
      media: [
        { src: 'assets/act4/mj-professor.png', alt: 'Image-model results for two prompts: “woman professor of digital culture” (top row) and “professor of digital culture” (bottom row), eight similar portraits, all wearing glasses.' },
        { src: 'assets/act4/mj-beautiful-woman.png', alt: 'Image-model results for “beautiful woman”: four near-identical close-up portraits of young women with dark hair and light eyes.' },
      ],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Ties the avatars to the argument: we made these sprites deliberately, with reference and consent, instead of accepting a model’s defaults.',
    },
    {
      id: 'a4-stanford', act: 4, minutes: 0.75, layout: 'image', room: 'commons', agency: 1,
      text: 'Defaults become policy: Stanford R&DE used AI to race-swap students in its advertising.',
      media: [{ src: 'assets/act4/stanford-race-swap.png', alt: 'News article: Stanford R&DE uses AI to race swap students for advertising, with before and after photos.' }],
      fx: ['iris-in'], draft: true,
      notes: 'Stanford Daily, Sept. 21, 2026. Confirm the citation.',
    },
    {
      id: 'a4-political', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 2,
      text: 'Our book is intentionally political, written in a state where humanities work was cast as a “public threat” (p. xiv; pp. 231–232).',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'Florida context. Making is never neutral, and neither is teaching it.',
    },
    {
      id: 'a4-superintelligence', act: 4, minutes: 0.75, layout: 'image', room: 'commons', agency: 1,
      text: '“Super Intelligence” by executive order.',
      media: [{ src: 'assets/act4/superintelligence.png', alt: 'Bluesky posts reporting an executive order requiring federal agencies to say “Super Intelligence” instead of “Artificial Intelligence.”' }],
      fx: ['iris-in'], draft: true,
      notes: 'Language as policy. Verify the order and its date before presenting.',
    },
    {
      id: 'a4-unmake-politics', act: 4, minutes: 0.75, layout: 'statement', room: 'commons', agency: 3,
      text: 'Maybe today’s politics is what we are trying to unmake.',
      fx: ['iris-in'], avatar: { pose: 'talk', x: 60 },
      notes: 'Pause here.',
    },
    {
      id: 'a4-frontier', act: 4, minutes: 0.5, layout: 'statement', room: 'office', agency: 2,
      text: 'Frontier AI is the platform cycle again: good to users first. We have seen how that story ends.',
      fx: ['iris-in'], avatar: { pose: 'talk', x: 60 },
      notes: 'Callback to Act I and Doctorow. Sending students and colleagues to frontier chatbots by default trains them into the next platform we overtrust. The alternative is the rest of this act.',
    },
    {
      id: 'a4-local-models', act: 4, minutes: 0.75, layout: 'image', room: 'workshop', agency: 3,
      text: 'Small, local, open: at the heart of agentic casual creators, we need small local models.',
      media: [{ src: 'assets/act4/apertus.png', alt: 'Apertus home page: the wordmark APERTVS above “Fully Open Foundation Model for Sovereign AI,” developed by the Swiss AI Initiative with EPFL, ETH Zurich, and CSCS. Open weights, open data, open science.' }],
      source: 'Swiss AI Initiative, Apertus',
      url: 'https://www.apertus-ai.org/',
      fx: ['pixel-dissolve'], avatar: { pose: 'point', x: 60 },
      notes: 'From the CAPE talk: to take control of our creative work through AI, we need to learn from projects like the Swiss AI Initiative and build community-driven tools that are thoughtfully and intentionally sourced. Apertus is public institutions building a model in the open.',
    },
    {
      id: 'a4-why-local', act: 4, minutes: 1, layout: 'choice', room: 'workshop', agency: 4,
      heading: 'Why local?',
      choices: ['It runs on machines we can see', 'Our data and our students’ data stay home', 'No vendor can change the terms overnight', 'We can study it, tune it, and take it apart'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'Reveal one per press. Local models are less capable than frontier models, and that is part of the lesson: their limits are visible. Control, privacy, stability, and literacy all come from being able to hold the model.',
    },
    {
      id: 'a4-dh-hub', act: 4, minutes: 1, layout: 'image', room: 'commons', agency: 4,
      text: 'The DH center as hub: where people come for AI help, and leave with literacy and control instead of a subscription.',
      media: [{ src: 'assets/act4/cape-lab.png', alt: 'Pixel-art poster for CAPE, the Creative AI, Play, and Empowerment Lab: a figure with a lantern looks out over an island town toward a glowing peak, beside signposts reading Culture, Democracy, Equity, Creativity, Play, and a friendly robot.' }],
      source: 'CAPE: Creative AI, Play, and Empowerment Lab',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'From the CAPE talk: our field’s history of customized tool-making, and of building entry points into procedural creativity for those not versed in code, is essential to finding ways forward. DH scholars are well positioned to make these interventions through collaborative, feminist approaches to research-creation. The center redirects people away from frontier defaults toward local models, community tools, and the skills to inspect both.',
    },
    {
      id: 'a4-classroom', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 5,
      text: 'In DH classrooms, we can empower students to use agentic AI for research, critical making, and digital communication, without an alienating approach to programming education.',
      fx: ['pixel-dissolve'], avatar: { pose: 'point', x: 60 },
      notes: 'The opportunity.',
    },
    {
      id: 'a4-responsibility', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 5,
      text: 'We also have the responsibility to give students a critical lens on these tools, with pathways from frontier platforms to local models and greater control, never losing sight of community or their own expertise.',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'The responsibility. The agency meter is full: that is the goal.',
    },
    {
      id: 'a4-credits', act: 4, minutes: 0.75, layout: 'credits', room: 'commons', agency: 5,
      lines: [
        'CRITICAL (UN)MAKING AND THE AGENTIC HUMANITIES',
        'Act I · Paper: Emily K. Johnson',
        'Act II · Thread: Anastasia Salter',
        'Act III · Zine: Emily K. Johnson',
        'Act IV · Game: Anastasia Salter',
        'From our book Critical Making in the Age of AI',
        'Deck built with an agent from our outline, then unmade by hand',
        'THANK YOU FOR PLAYING',
      ],
      fx: ['iris-in'], say: 'Thanks for playing. Questions?',
      notes: 'Both of us on stage for Q&A. Leave this up.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT4_SCENES;
  else root.ACT4_SCENES = ACT4_SCENES;
})(globalThis);
