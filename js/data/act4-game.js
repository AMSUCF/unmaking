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
      id: 'a4-eliza', act: 4, minutes: 0.75, layout: 'image', room: 'office', agency: 1,
      text: 'Talking machines aren’t new: ELIZA, 1966.',
      media: [{ src: 'assets/act4/eliza.png', alt: 'E.L.I.Z.A. Talking: a browser recreation of Joseph Weizenbaum’s 1966 chatbot on a VT100-style terminal.' }],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Not in the outline yet, but the image is in the repo. The ELIZA effect: we read agency into pattern-matching.',
    },
    {
      id: 'a4-racter', act: 4, minutes: 0.75, layout: 'image', room: 'office', agency: 1,
      text: 'Neither is machine authorship: Racter and William Chamberlain, 1984.',
      media: [{ src: 'assets/act4/racter-chamberlain.png', alt: 'Spread from The Policeman’s Beard Is Half Constructed: computer-generated limericks labeled “Work of stupefying genius,” beside an engraving of a man clutching his head.' }],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Confirm the source of this spread before presenting. Human authors were always behind the "machine" author.',
    },
    {
      id: 'a4-triad', act: 4, minutes: 1.25, layout: 'statement', room: 'workshop', agency: 1,
      heading: 'Material, tools, time… and steps',
      text: 'Nowviskie’s triad (pp. 11–12), plus a fourth loss: control over the steps and decisions themselves, sold as convenience.',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'Bethany Nowviskie’s triad as we use it in the book. Agents add a fourth thing we can lose.',
    },
    {
      id: 'a4-contribution', act: 4, minutes: 1.25, layout: 'statement', room: 'workshop', agency: 0,
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
      id: 'a4-unmake', act: 4, minutes: 1.25, layout: 'choice', room: 'office', agency: 2,
      heading: 'Can we unmake the agent?',
      text: 'A critical maker… (p. 10)',
      choices: ['Reject the tool', 'Supplement the tool', 'Extend the tool', 'Critique the tool'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'Each press reveals one option, like a dialogue menu. From the book: a critical maker rejects, supplements, extends, and critiques the tool. All four, not one.',
    },
    {
      id: 'a4-ask', act: 4, minutes: 1.5, layout: 'choice', room: 'office', agency: 3,
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
      id: 'a4-classroom', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 4,
      text: 'In DH classrooms, we can empower students to use agentic AI for research, critical making, and digital communication, without an alienating approach to programming education.',
      fx: ['pixel-dissolve'], avatar: { pose: 'point', x: 60 },
      notes: 'The opportunity.',
    },
    {
      id: 'a4-responsibility', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 5,
      text: 'We also have the responsibility to give students a critical lens on these tools, with pathways to greater control, never losing sight of community or their own expertise.',
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
