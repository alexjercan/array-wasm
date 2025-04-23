const fps = 60;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
root.appendChild(canvas);

const ctx = canvas.getContext("2d");

const MEMORY_SIZE: number = 8192;

let w: WebAssembly.WebAssemblyInstantiatedSource = null;

type InitFunction = (memory: number, size: number) => void;
type TickFunction = (deltaTime: number) => void;

WebAssembly.instantiateStreaming(fetch("main.wasm"), {
    env: {
        memory: new WebAssembly.Memory({ initial: MEMORY_SIZE }),
        js_width: (): number => { return CANVAS_WIDTH; },
        js_height: (): number => { return CANVAS_HEIGHT; },
        js_random: (a: number, b: number): number => { return Math.random() * (b - a) + a; },
        js_clear_canvas: (): void => {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
        js_draw_rect: (x: number, y: number, w: number, h: number, color: number): void => {
            ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            ctx.fillRect(x, y, w, h);
        },
        js_fprintf: (stream: number, format: number, ...args: number[]): void => {
            const memory = new Uint8Array((w.instance.exports.memory as WebAssembly.Memory).buffer);
            let str = "";
            let i = format;
            while (memory[i] !== 0) {
                str += String.fromCharCode(memory[i]);
                i++;
            }

            const values = args.map(arg => {
                return memory[arg];
            });

            console.log(str, ...values);
        }
    },
}).then((value) => {
    let fpsInterval = 1000 / fps;

    w = value;

    let init = w.instance.exports.init as InitFunction;
    let tick = w.instance.exports.tick as TickFunction;

    const memory = (w.instance.exports.__heap_base as WebAssembly.Global).value;

    init(memory, MEMORY_SIZE);

    let then = Date.now();

    function gameLoop() {
        requestAnimationFrame(gameLoop);

        let now = Date.now();
        let elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            tick(elapsed);
        }
    }

    requestAnimationFrame(gameLoop);
}).catch(e => {
    console.error("Error instantiating the WebAssembly module", e);
});
