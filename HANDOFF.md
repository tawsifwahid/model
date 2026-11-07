> **এই কপির আপডেট:** সব ফাইল এখন একই ডিরেক্টরিতে। নিচের পুরোনো `css/`, `js/core/`, `js/props/`, `js/viewer/` পাথের বদলে শুধু ফাইলের নাম ব্যবহার করুন। three.js ও সহায়ক লাইব্রেরিগুলোও লোকাল আছে। সর্বশেষ চালানোর নির্দেশনা `README.md`-এ। নিচের মূল handoff ঐতিহাসিক প্রেক্ষাপট হিসেবে রাখা হলো।

# HANDOFF — Classroom cartoon short (Tawsif)
Paste this file + `classroom_props.js` into a new chat/account and say: "Continue from HANDOFF.md".

## User
Tawsif, writes Bengali, **mobile phone only**. Wants top quality always; save tokens by editing files (not rewriting) but never lower quality. Wants a backup + handoff with every deliverable. Final render will run in an Arena AI online sandbox (capabilities unverified: needs Node, Python, ffmpeg, Chromium; no GPU so render 1080p first).

## Project
Vertical cartoon short in the `/cartoon-3d-short` skill style: flat 2D bean-head character cards (plum outline) in a painted 3D world with black ink outlines, DOF only on close-ups, gliding cameras, hard cuts on big jumps, no captions, English voice, SFX + music, 1440x2560 @30fps. Expression changes 0–3 frames BEFORE the spoken word. Do not show cigarettes/drugs visually (keep as dialogue / generic cartoon props).

## Story (own script, ~120 s)
Teacher finds a cigarette pack in the classroom trash, knows CCTV is broken, bluffs the class. After 4 min silence **Jake** confesses to stealing clothes from the teachers' lounge; **Emma** gasps, Jake accuses her of snitching. After 3 more min **Chloe** (wheelchair 6 months) stands up: faking since September for free PE grades. **Backbencher** admits he got **Mr. Davis** fired (weed in bag) over D grades. Teacher demands whose pack it is — it is a fake plastic cigarette; whole class suspended.
Old SRT `main_voice_word_by_word.srt` uses OLD names (Arian/Priya/Shreya/Amit, Norway line): **new voice + new SRT needed**.

## Done
- `classroom_props.js` — `makeCR(THREE)`; props: desk, chair, bench, teacherDesk, blackboard, clock (`setTime(h,m,s)`), windowFrame, door, trashCan, locker, ceilingLight, noticeBoard, wheelchair, classroom. Each `CR.x()` returns a fresh inked Group; classroom: 8x7x3 m, board on -z wall, no ceiling.
- `classroom_preview.html` — phone viewer (OrbitControls, one button per prop).

## Open decisions
1. Keep ~120 s or cut to ~70 s / two parts. 2. Voice source. 3. Character look (teacher, Jake, Emma, Chloe, backbencher).

## Next steps
Character sheet page (14 expressions, drawn in code) -> Hook shot test -> `story.ts` shots -> audio -> stills on phone -> render in Arena AI sandbox (`templates/bridge`, `templates/audio`, `templates/scripts` of the skill).
Optional: export each prop to .glb (GLTFExporter) for Blender/other tools.

## Token-saving rules
Edit with str_replace, keep one prop per function, build pages by concatenating files, no re-reading finished files, do stills before renders.

---

# ADDENDUM — Standalone 3D Viewer (realistic, cinematic)

## নীতি (Rules)
- এই viewer একটি **আলাদা, স্বতন্ত্র** প্রজেক্ট। আপনার মূল প্রজেক্ট (`classroom_props.js`, `story.ts`, render pipeline) এর সাথে **কোনো লিংক/import নেই**। শুধু মডেল দেখায়।
- React/TypeScript নেই। শুধু HTML + CSS + আলাদা আলাদা JavaScript ফাইল। three.js r128 CDN থেকে।
- **একটি ফাইল আপডেট করলে অন্য ফাইলে হাত দিতে হয় না।** প্রতিটি prop নিজেকে `Registry.register(...)` দিয়ে নিজেই রেজিস্টার করে; UI চিপ স্বয়ংক্রিয় তৈরি হয়।
- সূর্যের আলোর স্টাইল রেফারেন্স ছবির মতো: গোল্ডেন-আওয়ার, ব্লাইন্ডের ডোরাকাটা ছায়া, পাতার ছায়া, নরম বাদামি ছায়া, হালকা গ্রেইন, গ্লো।
- মূল প্রজেক্টের কার্টুন "ink outline" এখানে **বাদ**, কারণ রিয়ালিস্টিক রেন্ডার চাওয়া হয়েছে। (মডেলের জ্যামিতি আলাদা, তাই কার্টুন প্রজেক্ট অক্ষত থাকে।)
- Drive-এর `classroom_props.js` ডাউনলোডের সময় আংশিক কাটা পড়েছিল (কিছু লাইন নেই), তাই প্রপগুলো পুরোপুরি নতুন করে, আরও ডিটেইলে বানানো হয়েছে।

## ফাইল ম্যাপ
```
index.html                 শুধু কাঠামো (লজিক নেই)
css/viewer.css             সব স্টাইল
js/manifest.js             কোন ফাইল কোন ক্রমে লোড হবে (নতুন ফাইল যোগ হলে শুধু এখানে)
js/loader.js               ক্রম মেনে ফাইল লোড; কোনো prop ফাইল ব্যর্থ হলে বাকিরা চলে
js/core/registry.js        Registry.register / create / list
js/core/builders.js        B.box, B.rbox, B.tube (বাঁকানো নল), B.rod, B.lathe, B.curved …
js/core/materials.js       শেয়ার্ড PBR ম্যাটেরিয়াল + প্রসিডিউরাল টেক্সচার (কাঠ, প্লাস্টার, ফ্যাব্রিক…)
js/core/optimize.js        Opt.mergeStatic (draw call কমায়), Opt.dispose
js/props/*.js              এক ফাইল = এক মডেল (desk, chair, bench, teacherDesk, teacherChair,
                           wheelchair, blackboard, clock, windowFrame, door, locker, trashCan,
                           ceilingLight, ceilingFan, noticeBoard, classroom)
js/viewer/environment.js   উষ্ণ প্রসিডিউরাল env-map
js/viewer/lighting.js      সূর্য, ছায়া, gobo (ব্লাইন্ড + পাতার ছায়া)
js/viewer/foliage.js       বাইরের গাছ/আকাশ, অদৃশ্য gobo
js/viewer/godrays.js       জানালার আলোর রশ্মি
js/viewer/postfx.js        Bloom, ACES, উষ্ণ গ্রেড, ভিনিয়েট, গ্রেইন
js/viewer/ui.js            চিপ, টুল, স্লাইডার
js/viewer/viewer.js        মূল সমন্বয়
HANDOFF.md                 এই ফাইল
```

## কীভাবে আপডেট করবেন
| কাজ | কোন ফাইল |
|---|---|
| টেবিল/ডেস্ক/চেয়ার/হুইলচেয়ার ডিজাইন বদল | শুধু ওই `js/props/….js` |
| কাঠ/রঙ/ধাতুর চেহারা বদল | `js/core/materials.js` |
| আলোর রঙ/তীব্রতা, ছায়ার কোণ | `js/viewer/lighting.js` |
| গ্লো, গ্রেইন, ভিনিয়েট, রঙের টোন | `js/viewer/postfx.js` (Grade shader) |
| বাইরের গাছ/আকাশ | `js/viewer/foliage.js` |
| বোতাম/লেআউট | `js/viewer/ui.js` + `css/viewer.css` |
| ক্লাসরুমে কোথায় কী বসবে | `js/props/classroom.js` |
| **নতুন মডেল যোগ** | নতুন `js/props/x.js` বানান + `js/manifest.js` এ এক লাইন |

নতুন prop-এর ন্যূনতম টেমপ্লেট:
```js
(function () {
  const B = window.B, M = window.Mat;
  Registry.register('myProp', {
    label: 'My Prop', bn: 'আমার প্রপ', order: 60,
    lift: 0,                                   // দেয়ালে ঝুলালে মাটি থেকে উচ্চতা
    cam: { pos: [1.5, 1.2, 1.8], target: [0, 0.4, 0] },
    build() { const g = B.group('myProp'); g.add(B.box(1, .1, 1, M.get('woodLight'), 0, .5, 0)); return g; }
  });
})();
```

## মডেল কনভেনশন
- একক: মিটার, y উপরে, মূল বিন্দু = মেঝের কেন্দ্র (দেয়াল-প্রপের ক্ষেত্রে নিজের কেন্দ্র)।
- সামনের মুখ +z (ব্যতিক্রম: `bench` — ছাত্ররা +z এ বসে, -z এ মুখ; `teacherDesk` — ড্রয়ার -z এ, ক্লাসের দিকে প্যানেল +z)।
- `clock.setTime(h, m, s)` আগের মতোই আছে।
- ক্লাসরুম ৮×৭×৩ মি, ব্ল্যাকবোর্ড -z দেয়ালে, জানালা +x দেয়ালে (আসল ফাঁক), দরজা -x দেয়ালে। সিলিং একমুখী (ওপর থেকে অদৃশ্য কিন্তু ছায়া ফেলে)।

## অপটিমাইজেশন (ডিজাইন অপরিবর্তিত)
- একই ম্যাটেরিয়ালের স্থির মেশ মার্জ → draw call অনেক কম (`Opt.mergeStatic`)।
- ম্যাটেরিয়াল ও টেক্সচার শেয়ার্ড; প্রপ বদলালে জিওমেট্রি dispose।
- ছায়া স্থির তাই শুধু বদলালে একবার আঁকা হয় (`shadowMap.autoUpdate=false`)।
- গাছের পাতা `InstancedMesh`। পিক্সেল-রেশিও কোয়ালিটি অনুযায়ী সীমিত। ট্যাব লুকালে রেন্ডার বন্ধ।
- FPS ৩০-এর নিচে গেলে গভর্নর রেজোলিউশন ধাপে ধাপে কমায়।

## মোবাইল কন্ট্রোল
এক আঙুল = ঘোরানো · দুই আঙুল = জুম/প্যান · নিচের চিপ = মডেল · ডানের বোতাম: Spin, FX (আলো/রশ্মি), Walls (ক্লাসরুমে দেয়াল লুকানো), Quality (Low/Med/High), Reset, Save (PNG) · স্লাইডার = সূর্যের উচ্চতা।

## ব্যবহার
কোনো সার্ভার-স্ক্রিপ্ট লাগে না, তবে ব্রাউজারে লোকাল ফাইল থেকে স্ক্রিপ্ট লোড ব্লক হলে যেকোনো স্ট্যাটিক হোস্টিং/লোকাল সার্ভারে (`python -m http.server`) চালান।
