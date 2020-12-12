// IMPORTANT:
// RUN CONTROLLER FN

// class TestController {
//   constructor(private readonly dep1: string, private readonly dep2: number) {}
//
//   handle(args: string) {
//     console.log(this.dep1 + this.dep2);
//     console.log(args);
//   }
// }
//
// // !!!!!!!!!
// const testControllerInstance = new TestController(
//   "Injected by the module wrapper",
//   10000
// );
//
// // Get descriptor from decorator metadata
// const fn = testControllerInstance.handle;
// fn.apply(testControllerInstance, ["Hey"]);
