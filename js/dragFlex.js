(function (window) {
    window.dragFlex = function (conNav, callBack) {
        //获取元素
        /*conNav 就是与屏幕一样宽的   conList就是长长的ul
        * conNav是父容器   conList是子元素
        * */
        conList = conNav.children[0];
        transformCss(conList, 'translateZ', 0.01);
        //元素初始位置和手指开始位置
        var initY = 0;
        var startY;
        //加速變量
        /*開始位置-開始時間-結束位置-結束時間-*/
        var beginPosition = 0;
        var beginTime = 0;
        var endPosition = 0;
        var endTime = 0;
        /*距離差-時間差*/
        var disPosition = 0;
        /*之所以等於1，為了防止start-end錯誤邏輯，產生speed為Nan*/
        var disTime = 1;
        /*TWEEN算法对象变量*/
        var Tween = {
            //正常加速  lineara
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            },
            //回弹
            easeOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }

        };
        /*定时器*/
        var tweenTimer = null;


        /*防抖动变量*/
        var isFirst = true;
        var isY = true;
        var startX = 0;


        /*start------move-----end-----加速------停止
        * start      move    不检测    move      end
        *
        * */

        conNav.addEventListener("touchstart", function (event) {

            //清除定时器
            clearInterval(tweenTimer);

            //清除過度
            conList.style.transition = 'none';

            //清除速度值，防止速度在（start-end邏輯）讀取上一次的speed。
            disPosition = 0;

            var touch = event.changedTouches[0];
            initY = transformCss(conList, "translateY");
            startY = touch.clientY;
            startX = touch.clientX;

            /*加速-開始位置-開始時間*/
            beginPosition = transformCss(conList, 'translateY');
            beginTime = new Date().getTime();

            //重置
            isFirst=true;
            isY=true;

            /*外部callback逻辑
            * */
            if (callBack && typeof callBack['start'] == 'function') {
                callBack['start']();
            }
        });

        conNav.addEventListener("touchmove", function (event) {
            if(!isY){
                return;
            }
            var touch = event.changedTouches[0];
            var endY = touch.clientY;
            var endX=touch.clientX;
            var disY = endY - startY;
            var disX=endX-startX;
            var translateY = disY + initY;

            /*防抖动逻辑*/
            if(isFirst){
                isFirst=false;
                if(Math.abs(disX) > Math.abs(disY)){
                    isY=false;
                    return;
                }
            }



            /*范围限定*/
            if (translateY > 0) {
                //橡皮筋右邊的
                var scale = 1 - translateY / document.documentElement.clientHeight;
                /*拋物線運動，峰值為375/2px*/
                translateY = 0 + translateY * scale;

            } else if (translateY < document.documentElement.clientHeight - conList.offsetHeight) {
                /*未成比例的留白區間-正值-*/
                var over = Math.abs(translateY) - (conList.offsetHeight - document.documentElement.clientHeight);
                var scale = 1 - over / document.documentElement.clientHeight;
                /*求新的tx=臨界值+over*scale--本身應該為負數*/
                translateY = document.documentElement.clientHeight - conList.offsetHeight - over * scale;
            }
            //確定位置
            transformCss(conList, "translateY", translateY);

            /*加速-結束位置-開始時間-間距位置-時間*/
            endPosition = translateY;
            endTime = new Date().getTime();
            disPosition = endPosition - beginPosition;
            disTime = endTime - beginTime;

            /*外部callback逻辑
            * */
            if (callBack && typeof callBack['move'] == 'function') {
                callBack['move']();
            }
        });

        /*加速邏輯--放在touchend---（兩邊）回彈的邏輯*/
        conNav.addEventListener("touchend", function () {
            /*speed--自帶正負-判斷其向左向右*/
            var speed = disPosition / disTime;

            /*默认是为linear--模拟加速过程
            * 而easeOut--摸您回弹过程
            * */
            var type = 'Linear';
            /* 這段邏輯直接放在end上就不會有兩個坑。而放在move中就會有。
            *加速-結束位置-開始時間-間距位置-時間
            *endPosition=translateX;
            *endTime=new Date().getTime();
            *disPosition=endPosition-beginPosition;
            *disTime=endTime-beginTime;
            *坑1：
            *speed也在這裡有個小BUG，如果用戶start-end 這樣的邏輯，就會去讀取上一回的speed的值
            * 所以在這裡對speed清零，可以在前面直接加上speed=0；也可以在start邏輯上，對disPosition進行清零。
            * 坑2：一開始操作start-end之後產生了NAN speed=disPosition/disTime; 0/0=nan  就會沒有辦法執行下面的邏輯
            * */


            //目標距離=touchmove產生的距離+speed速度產生的值---速度越大，結束后，會自動滑的距離--目標距離+當前已經TX
            var target = transformCss(conList, 'translateY') + speed * 100;


            //兩邊才需要回彈--回彈就是過渡加上貝塞爾曲線-cubic-bezier(0.08, 1.44, 0.6, 1.46)
            //如果是中間的話，是不需要回彈邏輯的。所以cubic不能直接寫(0.08, 1.44, 0.6, 1.46)

            if (target > 0) {
                /*如果在左邊緣，回彈*/
                target = 0;
                type = 'easeOut';

            } else if (target < document.documentElement.clientHeight - conList.offsetHeight) {
                target = document.documentElement.clientHeight - conList.offsetHeight;
                type = 'easeOut';
            }

            // console.log(target);
            /*执行的总时间*/
            var totalTime = 1;

            /*即点即停的逻辑*/
            move(target, totalTime, type);

        });

        //函数move
        function move(target, totalTime, type) {

            //t ： 当前次数
            var t = 0;
            //b ： 起始位置
            var b = transformCss(conList, 'translateY');
            //c ： 结束位置与起始位置距离差
            var c = target - b;
            //d ： 总次数
            var d = totalTime / 0.02;

            /*防止重复开启定时器--多次点击才生效*/
            clearInterval(tweenTimer);

            tweenTimer = setInterval(function () {
                t++;
                if (t > d) {
                    //清除定时器
                    clearInterval(tweenTimer);


                    /*外部callback逻辑
                   * */
                    if (callBack && typeof callBack['end'] == 'function') {
                        callBack['end']();

                    }

                } else {
                    //正常执行
                    //返回一个当前位置运动的位置值
                    var point = Tween[type](t, b, c, d);
                    console.log(point);
                    transformCss(conList, 'translateY', point);


                    /*外部callback逻辑
                    * */
                    if (callBack && typeof callBack['move'] == 'function') {
                        callBack['move']();
                    }

                }
            }, 20);


        }

    };

})(window);