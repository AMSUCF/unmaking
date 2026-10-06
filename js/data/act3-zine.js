/* Act III — E-zine — presented by Emily K. Johnson. Outline: "who owns what we make?" */
(function (root) {
  'use strict';
  const ACT3_SCENES = [
    {
      id: 'a3-flash-dead', act: 3, minutes: 0.75, layout: 'statement',
      heading: 'Flash is dead.',
      text: 'So is Twine pointless now? If an agent can make the thing, who owns what gets made?',
      fx: ['xerox-scan'], say: 'Fresh off the copier.',
      notes: 'Emily returns. The transition from the outline: Flash is dead; is Twine pointless now? Into ownership.',
    },
    {
      id: 'a3-act', act: 3, minutes: 0.5, layout: 'statement',
      heading: 'Act III: Who Owns What We Make?',
      text: 'Walled gardens · preservation · maintenance',
      fx: ['ransom-shuffle'],
      notes: 'Section title. Zines are the original answer to "who owns": copy it, staple it, hand it on.',
    },
    {
      id: 'a3-walled', act: 3, minutes: 1, layout: 'image',
      text: 'Previous platforms in this space suffered from walled gardens. RIP Flash, and all the dead works on the App Store.',
      media: [{ src: 'assets/act3/flash.jpg', alt: 'Cover of Flash: Building the Interactive Web by Anastasia Salter and John Murray.' }],
      fx: ['sticker-slap'], avatar: { pose: 'point', x: 60 },
      notes: 'Anastasia and John Murray’s Flash book. Corporate walled gardens and the works lost with them.',
    },
    {
      id: 'a3-lawhead', act: 3, minutes: 1.5, layout: 'quote',
      text: '“I feel like there’s a lot to learn from Flash. As an example of what technology enables for ‘the little people’, as an example of what it takes to destroy that and basically eradicate a huge portion of digital history, and as an example of how easy it is for something like that to just happen. If you look at it through the lens of digital history, it’s a good example of how easy it is for something that was really powerful and popular to be lost without much of a trace of what it once was.”',
      source: 'Nathalie Lawhead, “A Short History of Flash”',
      url: 'https://www.nathalielawhead.com/candybox/a-short-history-of-flash-the-forgotten-flash-website-movement-when-websites-were-the-new-emerging-artform',
      media: [{ src: 'assets/act3/lawhead-flash.png', alt: 'Collage of 2000s Flash websites under the caption “What did the space really look like?”' }],
      fx: ['misregister'], avatar: { pose: 'point', x: 60 },
      notes: 'Read the quote. "The little people": who technology empowers, and how fast it can be erased.',
    },
    {
      id: 'a3-preservation', act: 3, minutes: 1.25, layout: 'gallery',
      text: 'Flash preservation reminds us to support open data while communities build new walls, and warns against over-investing in proprietary systems that hide their source.',
      media: [
        { src: 'assets/act3/flash-preservation-1.jpg', alt: 'Homestar Runner beside a browser warning that the Flash plugin is vulnerable and should be updated.' },
        { src: 'assets/act3/flash-preservation-2.png', alt: 'Google search “why did flash die” with an AI Overview citing security flaws, poor performance, and HTML5.' },
      ],
      fx: ['sticker-slap'],
      notes: 'Especially systems that compile and hide their source code. Agents are, in a sense, the ultimate compiled black box.',
    },
    {
      id: 'a3-libgen', act: 3, minutes: 1, layout: 'image',
      text: 'Meanwhile, something is reading everything we make.',
      media: [{ src: 'assets/act3/libgen.png', alt: 'The Atlantic’s LibGen author search for “Anastasia Salter”, with 26 results including Jane Jensen and Plundered Hearts.' }],
      fx: ['xerox-scan'], draft: true,
      notes: 'From the Author Function talk: Books3, LibGen, and The Atlantic’s search tool. Decide whether this belongs here or in Act I.',
    },
    {
      id: 'a3-perlow', act: 3, minutes: 1.5, layout: 'quote',
      text: '“I close by addressing one area where responses to large AI models have been surprisingly reactionary—that of intellectual property. Objections to large AI models on copyright grounds amount to a dramatic reversal of attitudes among the American left, what Kirschenbaum and Raley call a ‘new copyright fundamentalism.’ Two decades ago, many people now urging copyright infringement claims against AI firms were deriding Metallica and the RIAA for their lawsuits against Napster and its successors. Back then, piracy was cool; we called it ‘sharing.’”',
      source: 'Seth Perlow, “Generative Theories, Pretrained Responses: Large AI Models and the Humanities”',
      fx: ['misregister'], avatar: { pose: 'talk', x: 60 },
      notes: 'A provocation we take seriously without fully endorsing. Zines were built on sharing.',
    },
    {
      id: 'a3-gardens', act: 3, minutes: 1, layout: 'statement',
      text: 'Beyond copyright and credit: the tension between making things in other people’s walled gardens and planting an entirely new garden.',
      fx: ['ransom-shuffle'],
      notes: 'Authorship versus ownership. The question is not only who gets paid, but where the thing can live.',
    },
    {
      id: 'a3-elon', act: 3, minutes: 1.25, layout: 'video',
      heading: 'You Are Elon Musk',
      source: 'direkris, itch.io',
      url: 'https://direkris.itch.io/elon',
      media: [{ src: 'assets/act3/you-are-elon-musk.mp4', alt: 'Screen recording of the interactive fiction You Are Elon Musk by direkris.' }],
      fx: ['sticker-slap'],
      notes: 'Click the video to play (it does not autoplay; click does not advance). The open web at its best: a sharp, small, self-published game.',
    },
    {
      id: 'a3-nudification', act: 3, minutes: 1, layout: 'statement',
      text: 'If Twine is the best of open source, the nudification and deepfake tools that pre-date Musk’s iterations are the worst.',
      source: 'Reuters, “US appeals court blocks Minnesota’s AI nudification law” (Oct. 2, 2026)',
      url: 'https://www.reuters.com/world/us-appeals-court-blocks-minnesotas-ai-nudification-law-now-xai-lawsuit-2026-10-02/',
      fx: ['xerox-scan'], draft: true,
      notes: 'Openness cuts both ways. TODO: add the Reuters article header screenshot and make this an image scene.',
    },
    {
      id: 'a3-tracery', act: 3, minutes: 1, layout: 'image',
      heading: 'Maintenance is resistance',
      text: 'Community: the people who keep the tools running.',
      media: [{ src: 'assets/act3/tracery.png', alt: 'Crystal Code Palace’s Tracery tutorial, with a grammar of animals and a list of generated results.' }],
      fx: ['xerox-scan'],
      notes: 'Kate Compton’s Tracery, and the people who kept it alive.',
    },
    {
      id: 'a3-cbdq', act: 3, minutes: 1.5, layout: 'gallery',
      text: 'The community rebuilt Tracery bots after Twitter broke them (p. 244): Cheap Bots, Done Quick! → Toot Sweet! → Blue Bots, Done Quick!',
      media: [
        { src: 'assets/act3/cbdq.jpg', alt: 'Cheap Bots, Done Quick! by v buckenham, with its April 2023 closure notice after Twitter ended API access.' },
        { src: 'assets/act3/cbts.jpg', alt: 'Cheap Bots, Toot Sweet!, the Mastodon successor using the same Tracery syntax.' },
        { src: 'assets/act3/bbdq.jpg', alt: 'Blue Bots, Done Quick! by Olaf Moriarty Solstrand, for Bluesky.' },
        { src: 'assets/act3/flores-workshop.jpg', alt: 'Leonardo Flores’s Bluesky Bot Workshop document.' },
      ],
      fx: ['sticker-slap'], avatar: { pose: 'point', x: 60 },
      notes: 'v buckenham, boodooperson, Olaf Moriarty Solstrand, and Leonardo Flores’s workshop. Each time the platform broke, the community rebuilt.',
    },
    {
      id: 'a3-inspect', act: 3, minutes: 1, layout: 'statement',
      text: 'We need shared patterns for inspecting agents, not just ban policies.',
      fx: ['ransom-shuffle'], avatar: { pose: 'talk', x: 60 },
      notes: 'The constructive turn, which Act IV makes concrete.',
    },
    {
      id: 'a3-handoff', act: 3, minutes: 1, layout: 'handoff', to: 'game',
      heading: 'Insert coin',
      text: 'Over to Anastasia.',
      fx: ['zine-to-pixels'], say: 'Player two, press start.',
      notes: 'The zine page breaks into pixels and becomes a game room. Anastasia takes Act IV.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT3_SCENES;
  else root.ACT3_SCENES = ACT3_SCENES;
})(globalThis);
