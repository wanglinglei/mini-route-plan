let isDragging = false; // 是否绘制中
let startX = 0, startY = 0; // 初始化坐标
let image;
let backgroundImage;
let context;
let canvas;
let segmentLengths = [];// 分段长度集合
let lengthsUpToPoint = [];// 每段长度累加集合
let
  totalLength = 0;  // 路线总长度

let initial_percentage = 0.1; // 人物初始化位置
let end_percentage = 0.2; // 人物运动目标位置

let segment = 0;
let movePerFrame = totalLength / 4000;
let startTime = null;
let animationId;
let systemInfo = {};
// 500*500
const backgroundUrl='https://img1.baidu.com/it/u=3331457988,2002546671&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500';
// 200*200
// const backgroundUrl='https://img.duoziwang.com/2017/09/1612362494443.jpg';
// 130*170
// const backgroundUrl='https://img1.baidu.com/it/u=2970607738,1213144244&fm=253&fmt=auto?w=130&h=170';
// 500*667
// const backgroundUrl='https://img0.baidu.com/it/u=1369138877,4025103568&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667';

// const backgroundUrl = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202005%2F15%2F20200515181217_sUsQA.jpeg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1692179371&t=423c5d3356bce49855689f0f80cd8b65'
import { points } from "../../common/constants";
import { log } from "../../common/utils";
import {
  calculatePointLength,
  calculateRouteTotalLength,
  calculateSegmentsLengths,
  createRouteLine,
  getCurrentSegment,
  drawCharacterImage,
  drawBackgroundImage,
  createCanvasImage,
  getCanvasWidthAndHeight,
  getSystemInfo
} from '../../common/index'
Page({
  data: {
    pageReady: false
  },
  async onLoad() {
    totalLength = calculateRouteTotalLength(points);
    movePerFrame = totalLength / 4000;
    const { lengthsUpToPoint: lengthsUpToPointRes, segmentsLengths: segmentsLengthsRes } = calculateSegmentsLengths(points);
    lengthsUpToPoint = lengthsUpToPointRes;
    segmentLengths = segmentsLengthsRes;
    const { width, height, scale } = await getCanvasWidthAndHeight({ src: backgroundUrl });
    systemInfo = await getSystemInfo()
    // console.log('%c获取canvas宽高','color:chartreuse',{width,height,scale});
    log('获取canvas宽高', { width, height, scale });
    this.setData({
      pageReady: true,
      style: {
        width: width + 'px',
        height: height + 'px',
      }
    })
  },
  /**
* @description: canvas 初始化回调
* @return {*}
*/
  onCanvasReady() {
    // this.move()
    my.createSelectorQuery().select('#canvasTest').node().exec(async (res) => {
      canvas = res[0].node
      const ctx = canvas.getContext('2d')
      context = ctx;
      // console.log('%ccanvas-ctx', 'color:red', ctx);
      log('canvas-ctx', ctx);
      ctx.fillStyle = "blue";
      ctx.fillRect(10, 10, 100, 100);
      // this.move();
      //       setInterval(() => {
      //   this.move();
      // }, 1)
      await this.createBackgroundImage();
      drawBackgroundImage({ context, image: backgroundImage });
      createRouteLine({ context, points });
      this.createCharacterImage();
    })
  },

  /**
* @description: 创建人物图片
* @return {*}
*/
  async createCharacterImage() {
    // image = context.createImage();
    // image.src = 'https://img2.baidu.com/it/u=47347863,903517934&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=497';
    // image.onload = () => {
    //   this.initCharacterImage()
    // }
    image = await createCanvasImage({ canvas, src: 'https://img2.baidu.com/it/u=47347863,903517934&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=497' });
    this.initCharacterImage();
  },
  /**
   * @description: 创建背景图片
   * @return {*}
   */
  async createBackgroundImage() {
    backgroundImage = await createCanvasImage({ canvas, src: backgroundUrl })
  },
  /**
   * @description: 初始化人物位置
   * @return {*}
   */
  initCharacterImage() {
    const initialTravelled = initial_percentage * totalLength;
    let initialSegment = segment;
    while (initialTravelled >= lengthsUpToPoint[initialSegment + 1]) {
      initialSegment++;
    }
    const initialProgressInSegment = (initialTravelled - lengthsUpToPoint[initialSegment]) / segmentLengths[initialSegment];
    const initialX = points[initialSegment].x + initialProgressInSegment * (points[initialSegment + 1].x - points[initialSegment].x);
    const initialY = points[initialSegment].y + initialProgressInSegment * (points[initialSegment + 1].y - points[initialSegment].y);
    drawCharacterImage({ context, image, tempX: initialX, tempY: initialY });
  },
  play() {
    if (end_percentage > 1) {
      return
    }
    startTime = null;
    canvas.requestAnimationFrame(this.createAnimation.bind(this))
  },
  createAnimation(timestamp) {
    if (!isDragging) {
      if (!startTime) startTime = timestamp - (initial_percentage * 4000);
      const progress = timestamp - startTime;
      const travelled = progress * movePerFrame;
      console.log('movePerFrame', progress, travelled, movePerFrame);
      while (travelled >= lengthsUpToPoint[segment + 1] && segment + 1 < points.length - 1) {
        segment++;
      }
      console.log(progress, timestamp, startTime, segment, travelled);
      const progressInSegment = (travelled - lengthsUpToPoint[segment]) / segmentLengths[segment];
      const x = points[segment].x + progressInSegment * (points[segment + 1].x - points[segment].x);
      const y = points[segment].y + progressInSegment * (points[segment + 1].y - points[segment].y);
      // if (x > windowWidth / 2 && y > windowHeight / 2) {
      //   // drawCharacterImage({ context, image, tempX: windowWidth / 2, tempY: windowHeight / 2 });
      //   context.translate( windowWidth / 2-x, y - windowHeight / 2);
      // } else {
      //   // drawCharacterImage({ context, image, tempX: x, tempY: y });
      // }
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (x > windowWidth / 2 && y > windowHeight / 2) {
        // drawCharacterImage({ context, image, tempX: windowWidth / 2, tempY: windowHeight / 2 });
        // context.setTransform(1,0,0,1, windowWidth / 2-x, windowHeight / 2-y);
      } else {
        // drawCharacterImage({ context, image, tempX: x, tempY: y });
      }
      drawBackgroundImage({ context, image: backgroundImage });
      createRouteLine({ context, points });
      // 判断当前是x y 是否到达中心点位置
      const { windowWidth, windowHeight } = systemInfo;
      if (x > windowWidth / 2 && y > windowHeight / 2) {
        context.setTransform(1,0,0,1, windowWidth / 2-x, windowHeight / 2-y);
        drawCharacterImage({ context, image, tempX: x, tempY: y });
      } else if(x>windowWidth / 2 && y<windowHeight / 2) {
        context.setTransform(1,0,0,1, windowWidth / 2-x, 0);
        drawCharacterImage({ context, image, tempX: x, tempY: y }); 
      }else if(x<windowWidth / 2 && y>windowHeight / 2) {
        context.setTransform(1,0,0,1, x, windowHeight/2-y);
        drawCharacterImage({ context, image, tempX: x, tempY: y }); 
      }else{
        drawCharacterImage({ context, image, tempX: x, tempY: y });
      }
      console.log('createAnimation', x, y);
      console.log('progressInSegment', progressInSegment, segment);

      if (travelled < totalLength * end_percentage) {
        animationId = canvas.requestAnimationFrame(this.createAnimation.bind(this))
      } else {
        initial_percentage = end_percentage;
        end_percentage = end_percentage + 0.1;
        canvas.cancelAnimationFrame(animationId);
      }
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
      createRouteLine({ context, points });
      console.log(points[segment]);
      drawCharacterImage({ context, image, tempX: points[segment].x, tempY: points[segment].y });
      canvas.requestAnimationFrame(this.createAnimation.bind(this))
    }
  }
});
