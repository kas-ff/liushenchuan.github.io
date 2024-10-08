import { Player } from '/static/js/player/base.js';
import { GIF } from '/static/utils/gif.js';

class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {
        let outer = this;
        let offset = [0, -22, -22, -140, 0, 0, 0];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,   //总帧数
                frame_rate: 15,   //每5帧过度一次
                offset_y: offset[i],    //垂直方向偏移量
                loaded: false,  //是否加载完成
                scale: 2,       //放大多少倍
            });

            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if(i === 3) {
                    obj.frame_cnt = 8;
                }
            };
        }
    }
}

export {
    Kyo
}
