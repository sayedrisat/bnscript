const COMMANDS = [
  {
    id: "bnscript.checkCurrentFile",
    title: "BN Script: Check Current File",
    action: "check",
    success_bn: "BN Script check sofol hoyeche.",
    success_en: "BN Script check completed successfully.",
    failure_bn: "Check byartho hoyeche.",
    failure_en: "Check failed.",
  },
  {
    id: "bnscript.buildCurrentFile",
    title: "BN Script: Build Current File",
    action: "build",
    success_bn: "BN Script build sofol hoyeche.",
    success_en: "BN Script build completed successfully.",
    failure_bn: "Build byartho hoyeche.",
    failure_en: "Build failed.",
  },
  {
    id: "bnscript.runCurrentFile",
    title: "BN Script: Run Current File",
    action: "run",
    success_bn: "BN Script run sofol hoyeche.",
    success_en: "BN Script run completed successfully.",
    failure_bn: "Run byartho hoyeche.",
    failure_en: "Run failed.",
  },
];

module.exports = {
  COMMANDS,
};
