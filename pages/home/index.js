let context;
let canvas;
let x = 0;
let y = 0;
let speedX = 1;
let speedY = 1;
let totalLength = 0;
const points = [{ x: 10, y: 10 }, { x: 30, y: 50 }, { x: 80, y: 130 },
{ x: 200, y: 200 }, { x: 300, y: 300 }, { x: 150, y: 400 }];
let segmentsLengths = [];// 分段长度集合
let lengthsUpToPoint = [];// 每段长度累加集合

let animationId;
let image;

// 初始化配置
let initialConfig = {
  initialPercent: 0.3,
  segment: 0,
  amount: 0,
}
// 目标配置
let targetConfig = {
  targetPercent: 0.5,
  segment: 0,
  amount: 0
}

import {
  calculatePointLength,
  calculateRouteTotalLength,
  calculateSegmentsLengths,
  createRouteLine,
  getCurrentSegment,
  drawCharacterImage
} from '../../common/index'
Page({
  data: {},
  onLoad() { },
  /**
 * @description: canvas 初始化回调
 * @return {*}
 */
  onCanvasReady() {
    // this.move()
    my.createSelectorQuery().select('#canvas').node().exec((res) => {
      canvas = res[0].node
      const ctx = canvas.getContext('2d')
      context = ctx;
      console.log('%ccanvas-ctx', 'color:red', ctx);
      ctx.fillStyle = "blue";
      ctx.fillRect(10, 10, 100, 100);
      // this.move();
      //       setInterval(() => {
      //   this.move();
      // }, 1)
      createRouteLine({ context, points });
      totalLength = calculateRouteTotalLength(points);
      const { lengthsUpToPoint: lengthsUpToPointRes, segmentsLengths: segmentsLengthsRes } = calculateSegmentsLengths(points);
      lengthsUpToPoint = lengthsUpToPointRes;
      segmentsLengths = segmentsLengthsRes;
      // 获取初始化配置
      initialConfig = {
        ...initialConfig,
        ...getCurrentSegment({ lengthsUpToPoint, totalLength, percent: initialConfig.initialPercent, segmentsLengths })
      }

      console.log('%c获取初始化配置', 'color:pink', initialConfig)
      this.createCharacterImage()

      targetConfig = {
        ...targetConfig,
        ...getCurrentSegment({
          lengthsUpToPoint, totalLength,
          percent: targetConfig.targetPercent, segmentsLengths
        })
      }
      console.log('%c获取目标配置', 'color:pink', targetConfig)

      // setTimeout(()=>{
      // createAnimation();

      // },3000)
    })
  },
  /**
* @description: 创建人物图片
* @return {*}
*/
  createCharacterImage() {
    image = context.createImage();
    image.src = 'https://cdn-esport-pro.hangzhou2022.cn/h22/20200903112929302100120023700968.png';
    image.onload = () => {
      const { segment } = initialConfig;
      let tempX = points[segment].x / 2;
      let tempY = points[segment].y / 2;
      drawCharacterImage({ context, image, tempX, tempY });
    }
  },
  /**
   * @description: 开始动画
   * @return {*}
   */
  play() {

    this.createAnimation();

  },
  /**
 * @description: 创建动画
 * @return {*}
 */
  createAnimation() {
    if (initialSegment <= targetSegment) {
      context.clearRect(0, 0, 600, 600);
      createRouteLine({ context, points });
      const { segment: initialSegment } = initialConfig;
      const { segment: targetSegment, amount: targetAmount } = targetConfig;
      console.log(initialSegment, targetSegment)
      let tempX = points[initialSegment].x + (points[initialSegment + 1].x - points[initialSegment].x) * targetAmount;
      let tempY = points[initialSegment].y + (points[initialSegment + 1].y - points[initialSegment].y) * targetAmount;
      console.log(tempX, tempY);
      drawCharacterImage({ context, image, tempX, tempY });
      if (segment === points.length - 2) {
        canvas.cancelAnimationFrame(animationId)
        return
      }
      if (segment <= points.length - 2 || amount !== 1) {
        amount += 0.005;
        if (amount > 1) {
          amount = 0;
          segment++;
           
        }
        animationId = canvas.requestAnimationFrame(this.createAnimation.bind(this))
      } else {
        canvas.cancelAnimationFrame(animationId)
      }
    }

  }

});
