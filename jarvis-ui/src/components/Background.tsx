import React, { useEffect, useRef } from "react";

class Point {
    x: number;
    y: number;
    value: string;
    speed: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.value = "";
        this.speed = 0;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        ctx2: CanvasRenderingContext2D,
        charArr: string[],
        fontSize: number,
        ch: number,
        randomInt: (min: number, max: number) => number,
        randomFloat: (min: number, max: number) => number
    ) {
        this.value = charArr[randomInt(0, charArr.length - 1)].toUpperCase();
        this.speed = randomFloat(1, 5);

        ctx2.fillStyle = "rgba(255,255,255,0.8)";
        ctx2.font = fontSize + "px sans-serif";
        ctx2.fillText(this.value, this.x, this.y);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px sans-serif";
        ctx.fillText(this.value, this.x, this.y);

        this.y += this.speed;
        if (this.y > ch) {
            this.y = randomFloat(-100, 0);
            this.speed = randomFloat(2, 5);
        }
    }
}

export function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvas2Ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvas2 = canvas2Ref.current;
        if (!canvas || !canvas2) return;

        const ctx = canvas.getContext("2d");
        const ctx2 = canvas2.getContext("2d");
        if (!ctx || !ctx2) return;

        // full screen dimensions
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        const charArr = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
        ];
        const fontSize = 10;
        const maxColums = cw / fontSize;
        canvas.width = canvas2.width = cw;
        canvas.height = canvas2.height = ch;

        function randomInt(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min) + min);
        }

        function randomFloat(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        }

        const fallingCharArr: Point[] = [];
        for (let i = 0; i < maxColums; i++) {
            fallingCharArr.push(new Point(i * fontSize, randomFloat(-500, 0)));
        }

        function update() {
            if (ctx && ctx2) {
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                ctx.fillRect(0, 0, cw, ch);

                ctx2.clearRect(0, 0, cw, ch);

                for (let i = 0; i < fallingCharArr.length; i++) {
                    fallingCharArr[i].draw(
                        ctx,
                        ctx2,
                        charArr,
                        fontSize,
                        ch,
                        randomInt,
                        randomFloat
                    );
                }

                requestAnimationFrame(update);
            }
        }


        update();
    }, []);

    return (
        <div>
            <canvas className="fixed z-0 inset-0" ref={canvasRef}>Canvas is not supported in your browser.</canvas>
            <div id="content"></div>
            <canvas className="fixed z-0 inset-0" ref={canvas2Ref}>Canvas is not supported in your browser.</canvas>
        </div>
    );
}
