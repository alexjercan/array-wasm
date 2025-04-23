let w: WebAssembly.WebAssemblyInstantiatedSource = null;

type SumFunction = (a: number, b: number) => number;

WebAssembly.instantiateStreaming(fetch("main.wasm"), {
    env: {
        memory: new WebAssembly.Memory({initial: 256}),
    },
}).then((value) => {
    w = value;

    let sum = w.instance.exports.sum as SumFunction;

    console.log(sum(1, 2));
});
