import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

class GameMap extends AcGameObject {
    constructor(root) {
        super();

        this.root = root;
        //tabindex='0'可以实现聚焦
        this.$canvas = $(`<canvas width="1280" height="720" tabindex = '0'></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();

        this.controller = new Controller(this.$canvas);

        this.root.$kof.append($(`
            <div class="kof_hp">
                <div class="kof_hp_0"><div><div></div></div></div>
                <div class="kof_hp_timer">60</div>
                <div class="kof_hp_1"><div><div></div></div></div>
            </div>
        `));

        this.timer_left = 60000;    //毫秒
        this.$timer = this.root.$kof.find('.kof_hp_timer');
    }

    start() {

    }

    update() {
        this.timer_left -= this.timedelta;
        if (this.timer_left < 0) {
            this.timer_left = 0;
            let players = this.root.players;
            let me = players[0], you = players[1];
            if (me.hp > you.hp) {
                if (you.status !== 6) {
                    you.status = 6;
                    you.frame_current_cnt = 0;
                    you.vx = 0;
                }
            } else if (me.hp < you.hp) {
                if (me.status !== 6) {
                    me.status = 6;
                    me.frame_current_cnt = 0;
                    me.vx = 0;
                }
            } else {
                if (me.status !== 6 && you.status !== 6) {
                    you.status = 6;
                    you.frame_current_cnt = 0;
                    you.vx = 0;
                    me.status = 6;
                    me.frame_current_cnt = 0;
                    me.vx = 0;
                }
            }
        }
        this.$timer.text(parseInt(this.timer_left / 1000));

        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());
    }
}

export {
    GameMap
}