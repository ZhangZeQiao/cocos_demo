// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    /* 
    TODO: Cocos Creator 规定一个节点具有的属性都需要写在 properties 代码块中，
    这些属性将规定主角的移动方式，在代码中我们不需要关心这些数值是多少，
    因为我们之后会直接在 属性检查器 中设置这些数值。
    TODO: 以后在游戏制作过程中，我们可以将需要随时调整的属性都放在 properties 中。
    */
    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            // TODO: 只有在属性声明时规定 type 为引用类型时（比如这里写的 cc.Prefab 类型），才能够将资源或节点拖拽到该属性上。
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: cc.Node
        },
        // score label 的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // TODO: onLoad 方法会在场景加载后立刻执行，所以我们会把初始化相关的操作和逻辑都放在这里面。
    // 可以初始化一些不常改变的属性。
    onLoad: function () {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化计分
        this.score = 0;

        console.log("------zzq-------")
    },

    spawnNewStar: function () {
        /* 
        TODO: cc.instantiate()：克隆指定的任意类型的对象，或者从 Prefab 实例化出新节点，返回值为 Node 或者 Object。
        instantiate 例示，举例说明，实例化
        （Instantiate 时，function 和 dom 等非可序列化对象会直接保留原有引用，Asset 会直接进行浅拷贝，可序列化类型会进行深拷贝。）
        */
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // TODO: 当前节点：this.node  因为此Game.js文件是添加到 Canvas 上，所以这里的 this.node 代表 Canvas
        // TODO: 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());

        // TODO: 在星星组件上暂存 Game 对象的引用
        // TODO: 获取JavaScript模块：this.player.getComponent('Player')
        newStar.getComponent('Star').game = this;

        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function () {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },

    // TODO: 只在第一次update前系统回调一次。这里可以初始化一些经常改变的属性。
    start() {

    },

    // TODO: update 在场景加载后就会每帧调用一次，我们一般把需要经常计算或及时更新的逻辑内容放在这里。
    // 每一帧渲染前系统回调，主要用于处理逻辑。dt为上一帧到当前帧时间ms间隔。
    // lateUpdate(dt)：每一帧渲染后系统回调，用于处理逻辑。dt为上一帧到当前帧时间ms间隔。
    update: function (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gainScore: function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        // TODO: 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function () {
        // TODO: Node extends _BaseNode.stopAllActions
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');

        /* 
        这里需要初学者了解的是，TODO: cc.director 是一个管理你的游戏逻辑流程的单例对象。
        由于 cc.director 是一个单例，你不需要调用任何构造函数或创建函数，
        使用它的标准方法是通过调用 cc.director.methodName()，例如这里的 cc.director.loadScene('game') 就是重新加载游戏场景 game，也就是游戏重新开始。
        而节点下的 stopAllActions 方法就显而易见了，这个方法会让节点上的所有 Action 都失效。
        */
    },

    heihei: function () {
        this.scoreDisplay.string = 'Game: heihei';
        console.log("------zzq-------Game: 嘿嘿");
    }

});
