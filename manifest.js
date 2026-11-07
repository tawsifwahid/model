/*
 * MANIFEST — কোন ফাইল কোন ক্রমে লোড হবে।
 * একটি ফাইল আপডেট করলে এখানে হাত দিতে হবে না। শুধু নতুন ফাইল যোগ করলে নাম লিখুন।
 * props এর কোনো ফাইল লোড না হলে বাকিগুলো ঠিকঠাক চলে।
 */
window.MANIFEST = {
  libs: [
    'three.min.js',
    'OrbitControls.js',
    'BufferGeometryUtils.js',
    'CopyShader.js',
    'LuminosityHighPassShader.js',
    'EffectComposer.js',
    'RenderPass.js',
    'ShaderPass.js',
    'UnrealBloomPass.js'
  ],
  core: [
    'registry.js',
    'builders.js',
    'materials.js',
    'optimize.js'
  ],
  props: [
    'desk.js',
    'chair.js',
    'bench.js',
    'teacherDesk.js',
    'teacherChair.js',
    'wheelchair.js',
    'blackboard.js',
    'clock.js',
    'windowFrame.js',
    'door.js',
    'locker.js',
    'trashCan.js',
    'ceilingLight.js',
    'ceilingFan.js',
    'noticeBoard.js',
    'classroom.js'
  ],
  viewer: [
    'environment.js',
    'lighting.js',
    'foliage.js',
    'godrays.js',
    'postfx.js',
    'ui.js',
    'viewer.js'
  ]
};
