/* Act II — Textile — presented by Anastasia Salter. Outline: "Why keep making?" */
(function (root) {
  'use strict';
  const ACT2_SCENES = [
    {
      id: 'a2-act', act: 2, minutes: 0.5, layout: 'statement',
      heading: 'Act II: Why Keep Making?',
      text: 'Thread · community · the learn-to-code wars',
      fx: ['stitch-in'], say: "Thanks, Emily. Let's pick up the needle.",
      notes: 'Anastasia takes over. The paper pattern is now cloth: making as slow, social, embodied work.',
    },
    {
      id: 'a2-unflatten', act: 2, minutes: 0.75, layout: 'statement',
      text: 'These tools are for building something personal and expressive. Is the point to unflatten, or is the point to create?',
      fx: ['needle-pass'], avatar: { pose: 'talk', x: 60 },
      notes: 'Pose the question we keep asking ourselves: are we critiquing (unflattening) or making? Critical making says both, at once.',
    },
    {
      id: 'a2-learn-to-code', act: 2, minutes: 1, layout: 'gallery',
      text: 'The learn-to-code movement (Hour of Code, “more hack, less yack,” credential-checking in DH) drew pushback for misogyny and for ignoring histories of exclusion.',
      media: [
        { src: 'assets/act2/geek.jpg', alt: 'Cover of Toxic Geek Masculinity in Media by Anastasia Salter and Bridget Blodgett.' },
        { src: 'assets/act2/fanboy.jpg', alt: 'Cover of A Portrait of the Auteur as Fanboy by Anastasia Salter and Mel Stanfill.' },
      ],
      fx: ['quilt-assemble'],
      notes: 'It is toxic geek masculinity all the way down. Name the history before celebrating access.',
    },
    {
      id: 'a2-widner', act: 2, minutes: 1.25, layout: 'quote',
      text: '“Yes, make 2012 your year of code. Learn to code. Not only is it a critical skill for DH folks, but coding should also be considered a basic literacy. I have been coding since I was 10 years old, when I learned BASIC (and its GOTOs) on my Commodore 64, one of the first popular home computers. I learned to code not because I had specific problems I wanted to solve; instead, coding was (and is) fun, a way of thinking, a way of making the computer do neat things, and an entry into a fascinating and rich culture.”',
      source: 'Michael Widner, “Learn to Code; Learn Code Culture,” HASTAC (2012)',
      fx: ['stitch-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The optimistic case, sincerely meant. We would be remiss not to mention the death of HASTAC here.',
    },
    {
      id: 'a2-posner', act: 2, minutes: 1.25, layout: 'quote',
      text: '“Should you choose to learn in a group setting, you will immediately be conspicuous. It might be hard to see why this is a problem; after all, everyone wants more women in programming. Surely people are glad you’re there. Well, that’s true, as far as it goes. But it also makes you extremely conscious of your mistakes, confusion, and skill level. You are there as a representative of every woman. If you mess up or need extra clarification, it’s because you really shouldn’t — you suspected this anyway — you shouldn’t be there in the first place.”',
      source: 'Miriam Posner, “Some Things to Think About Before You Exhort Everyone to Code” (2012)',
      fx: ['stitch-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The same year, the response. Who gets to be a beginner in public?',
    },
    {
      id: 'a2-losh', act: 2, minutes: 1, layout: 'quote',
      text: '“Articulating a need for a feminist corrective in the digital humanities has come at a much slower pace, perhaps because the instrumentalism of a ‘tool’ seems much less blatantly anti-feminist than the instrumentalism of a gun.”',
      source: 'Elizabeth Losh, “What Can the Digital Humanities Learn from Feminist Game Studies?” DHQ 9.2 (2015)',
      fx: ['needle-pass'],
      notes: 'Tools are not neutral, just less obviously loaded.',
    },
    {
      id: 'a2-manovich', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'Cultural software',
      text: 'Lev Manovich and critical code studies: understanding code is part of understanding what produces culture, and black-box platforms hide exactly that.',
      fx: ['stitch-in'],
      notes: 'The counter-argument for learning code: not credentialing, but legibility of the systems that make culture.',
    },
    {
      id: 'a2-casual-creators', act: 2, minutes: 1.25, layout: 'gallery',
      text: 'Casual creators (Compton & Mateas) and low-code tools such as Twine, Tracery, Bitsy, and p5 are remixable because they share the common languages of the web.',
      media: [
        { src: 'assets/act2/cc-twine.png', alt: 'Twine’s editor with a single untitled passage on a blue grid.' },
        { src: 'assets/act2/cc-tracery.jpg', alt: 'Tracery’s tinygrammar editor beside generated names such as Cecil the baker.' },
        { src: 'assets/act2/cc-bitsy.png', alt: 'Bitsy’s editor showing a blue room, pixel avatar, and color picker.' },
        { src: 'assets/act2/cc-p5.png', alt: 'Pie chart titled Critical Making: Pieces, Arbitrarily Weighted, with slices for things, thoughts, processes, outcomes, and concepts.' },
      ],
      fx: ['quilt-assemble'], avatar: { pose: 'point', x: 60 },
      notes: 'In DH we have Omeka and Voyant. For creative work: Twine, Tracery, Bitsy, p5. Each is specialized, but they share HTML, CSS, and JS, so they can be remixed.',
    },
    {
      id: 'a2-kidpix', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'Kid Pix',
      text: 'Playful tools teach that software can have a personality, and that making can be joyful.',
      url: 'http://red-green-blue.com/kid-pix-the-early-years',
      fx: ['needle-pass'], draft: true,
      notes: 'Kid Pix, the early years (red-green-blue.com). TODO: add a Kid Pix screenshot and make this an image scene.',
    },
    {
      id: 'a2-lawhead-ui', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'UI as story',
      text: 'Nathalie Lawhead: interface design as a means to tell a story, convey emotion, and create personality.',
      url: 'https://www.nathalielawhead.com/candybox/on-ui-design-using-ui-as-a-means-to-tell-a-story-convey-emotion-create-personality-an-in-depth-look',
      fx: ['stitch-in'],
      notes: 'Lawhead’s in-depth essay on UI design. The interface itself is expressive material.',
    },
    {
      id: 'a2-communities', act: 2, minutes: 0.75, layout: 'image',
      text: 'These tools were built by communities.',
      media: [{ src: 'assets/act2/twining.png', alt: 'Cover of Twining: Critical and Creative Approaches to Hypertext Narratives by Anastasia Salter and Stuart Moulthrop.' }],
      fx: ['stitch-in'],
      notes: 'Twining, with Stuart Moulthrop: a book about a tool and the community that grew it.',
    },
    {
      id: 'a2-klimas', act: 2, minutes: 1.25, layout: 'quote',
      text: '“[Twine] might have been my graduate thesis, originally, if I had the patience to complete one … at the time, I had been experimenting with ways to create hypertext that were strongly code-oriented. I was studying interaction design, so Twine was my attempt to make something that would be friendly to people who were writers more than coders.”',
      source: 'Chris Klimas, interview with Anastasia Salter and Stuart Moulthrop for Twining',
      media: [{ src: 'assets/act2/twine-interface.png', alt: 'A Twine story map: passages as text boxes connected by arrows.' }],
      fx: ['needle-pass'], avatar: { pose: 'point', x: 60 },
      notes: 'A tool made for writers, not coders, by a designer thinking about who gets left out.',
    },
    {
      id: 'a2-bridge', act: 2, minutes: 0.5, layout: 'statement',
      text: 'From casual creators to agents: what happens when the tool can make the tool?',
      fx: ['stitch-in'], draft: true,
      notes: 'Outline: "more things need to be fleshed out here." Bridge from community-built tools to agents. Decide whether one or two more scenes belong here.',
    },
    {
      id: 'a2-metatools', act: 2, minutes: 1, layout: 'statement',
      text: 'Agentic AI coding tools are metatools. They work best making multipurpose things that replace proprietary platforms: our Canvas alternatives, my local recording, transcript, and video tools.',
      fx: ['needle-pass'], avatar: { pose: 'talk', x: 60 }, draft: true,
      notes: 'Concrete examples from our own practice. TODO: add screenshots of the Canvas alternative and the local recording/transcript tools (gallery).',
    },
    {
      id: 'a2-accessibility', act: 2, minutes: 0.75, layout: 'statement',
      text: 'Agentic AI also has significant implications for accessibility, as an interface and not just a generator.',
      fx: ['stitch-in'], draft: true,
      notes: 'Outline flags this; expand with an example (voice-driven building, alt-text workflows, adapting interfaces).',
    },
    {
      id: 'a2-process', act: 2, minutes: 1, layout: 'image',
      heading: 'Process was the point… isn’t it still?',
      text: 'Process over product (p. 14); making restores agency (p. xiii). Agents automate the intermediate steps.',
      media: [{ src: 'assets/act2/quilting.jpg', alt: 'Close-up of a sewing machine foot stitching purple and red appliqué onto yellow fabric.' }],
      fx: ['quilt-assemble'], avatar: { pose: 'talk', x: 60 },
      notes: 'From our book. If the intermediate steps are where learning and agency live, what do we lose when agents take them?',
    },
    {
      id: 'a2-handoff', act: 2, minutes: 1, layout: 'handoff', to: 'zine',
      heading: 'Lay the cloth on the copier',
      text: 'Back to Emily.',
      media: [{ src: 'assets/shared/fabric.jpg', alt: 'Folded yellow, purple, red, and cream fabrics fanned out on a cutting mat.' }],
      fx: ['scan-to-zine'], say: 'Make copies. Lots of copies.',
      notes: 'The cloth is scanned and becomes a photocopied zine. Emily takes Act III.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT2_SCENES;
  else root.ACT2_SCENES = ACT2_SCENES;
})(globalThis);
