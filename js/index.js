var wrap = document.getElementById('wrap');
/*取消瀏覽器默認行為*/
wrap.addEventListener('touchstart', function (event) {
    event.preventDefault();
});


/*設計稿設計尺寸--!作用于分號作用一樣*/
!(function (deginWidth) {
    var size = document.documentElement.clientWidth * 100 / deginWidth;
    document.documentElement.style.fontSize = size + "px";
    document.body.style.fontSize = "14px";
})(1080);


/*解決點透*/
!(function () {
    var aNodes = document.querySelectorAll('a');
    for (var i = 0; i < aNodes.length; i++) {
        aNodes[i].addEventListener('touchstart', function () {
            window.location.href = this.href;
        });
    }
})();


//邏輯部分
window.onload = function () {
    changeMenuBtn();
    getFocus();
    nav();
    changeLisColor();
    banner();
    tab();
    dragY();
};


//滚动条
function dragY() {
    var scrollBar=document.getElementById('scrollBar');
    /*父容器*/
    var conWrap=document.getElementById('conWrap');
    /*子容器去上拉下拉*/
    var content=document.getElementById('content');


    //求高
    var scale=document.documentElement.clientHeight/content.offsetHeight;
    scrollBar.style.height=document.documentElement.clientHeight*scale+'px';



    var callBack = {
        start: function () {
            scrollBar.style.opacity='1';
        },
        move: function () {
            scrollBar.style.opacity='1';
            //滚动条偏移量=内容偏移量*scale
            var dis=scale*(transformCss(content,'translateY'));
            transformCss(scrollBar,'translateY',-dis);
        },
        end: function () {
            scrollBar.style.opacity='0';
        }
    };

    //滑屏的逻辑
    dragFlex(conWrap,callBack);
}




//tab横向拖动-防抖动-小绿
function tab() {
    //获取元素
    /*对整个ul监听start move事件*/
    var tabWrap = document.querySelectorAll('#wrap #content .tab .tabWrap');
    var tabNav = document.querySelectorAll('#wrap #content .tab .tabNav');
    var tabNavWidth = tabNav[0].offsetWidth;

    /*tabWrap[0],tabNav[0]   tabWrap[1],tabNav[1]····*/
    for (var i = 0; i < tabWrap.length; i++) {
        move(tabWrap[i],tabNav[i]);

    }

    function move(tabWrap,tabNav) {

        transformCss(tabWrap,'translateZ',0.01);

        //页面一刷新就将UL置回中间那个
        transformCss(tabWrap, 'translateX', -tabNavWidth);

        //拖拽逻辑
        /*初始位置-起始位置*/
        var initX = 0;
        var startX = 0;
        var startY = 0;

        /*防抖动的两个Boolean值*/
        var isFirst = true;
        var isX = true;

        /*loading -是否在loading区域，若在loading内，禁止所有的start end move 滑动*/
        var isLoading=false;
        /*只拿到其相应大布局底下的loading，而不是文档的所有loading*/
        var loading=tabWrap.querySelectorAll('.loading');

        /*小绿-对其相应的元素儿子去拿*/
        var aNodes=tabNav.querySelectorAll('#wrap #content .tab .tabNav > a');
        var smallG=tabNav.querySelector('#wrap #content .tab .tabNav .smallG');
        transformCss(smallG,'translateZ',0.01);
        var nowA=0;

        tabWrap.addEventListener('touchstart', function (event) {

            if(isLoading){
                return;
            };


            /*清除过渡*/
            tabWrap.style.transition = 'none';



            /*初始位置-开始位置*/
            initX = transformCss(tabWrap, 'translateX');
            startX = event.changedTouches[0].clientX;
            startY = event.changedTouches[0].clientY;


            /*boolean重置*/
            isFirst = true;
            isX = true;

        });
        tabWrap.addEventListener('touchmove', function (event) {

            if(isLoading){
                return;
            }
            /*防抖动禁止非第一次*/
            if(!isX){
                return;
            }

            /*结束位置-距离差*/
            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;

            /*手指距离差*/
            var disX = endX - startX;
            var disY = endY - startY;

            /*防抖动*/
            if (isFirst) {
                isFirst = false;
                if (Math.abs(disY) > Math.abs(disX)) {
                    isX = false;
                    return;   //禁止第一次
                }
            }

            //确定位置
            transformCss(tabWrap, 'translateX', disX + initX);




            //手指划过1/2的位置 -在move逻辑中-
            if (Math.abs(disX) > tabNavWidth / 2) {
                var targetPosition = disX > 0 ? 0 : -2 * tabNavWidth;
                tabWrap.style.transition = '1s';
                transformCss(tabWrap, 'translateX', targetPosition);

                /*要显示图片就必须是放在超过1/2的位置--这里吕某写错了，一直感觉很奇怪的效果*/
                /*另外，这一行在小绿逻辑前面，否则会对nowA值进行干扰，只要刚好那一刻1/2触发了，那么就禁止了start end move 逻辑*/
                isLoading=true;

                /*小绿要移动就是在手指划过1/2处逻辑*/
                if(disX<0){
                    //go right and nowA more+1
                    nowA++;
                }else{
                    //go left and nowA less-1
                    nowA--;
                }

                /*限定范围*/
                if(nowA>aNodes.length-1){
                    nowA=0;
                }else if(nowA<0){
                    nowA=aNodes.length-1
                }
                smallG.style.transition='1s';
                /*注意这里虽然a元素没有绝对定位，但其父容器是有相对定位，故也可以求其值。这里要明白offsetleft是参照其已定位的父容器边缘的距离差*/
                transformCss(smallG,'translateX',aNodes[nowA].offsetLeft);

                //检测过渡结束后进行显示loading图标
                tabWrap.addEventListener('transitionend',fun);
                tabWrap.addEventListener('webkitTransitionEnd',fun);

                function fun() {

                    //显示图片
                    if(disX>0){
                        loading[0].style.opacity='1';
                    }else {
                        loading[1].style.opacity='1';
                    }

                    //模拟请求数据
                    setTimeout(function () {
                        /*在切换前，把所有的透明度设为0--以及把图片加载Boolean值置为FALSE*/
                        for(var i=0;i<loading.length;i++){
                            loading[i].style.opacity='0';
                        }
                        isLoading=false;
                        tabWrap.style.transition='10ms';
                        transformCss(tabWrap,'translateX', -tabNavWidth);
                    },600);

                    //解绑
                    tabWrap.removeEventListener('transitionend',fun);
                    tabWrap.removeEventListener('webkitTransitionEnd',fun);
                };


            }



        });

        /*手指没有划过1/2的位置 -在end逻辑里*/
        tabWrap.addEventListener('touchend', function (event) {

            if(isLoading){
                return;
            }
            /*这里是disX!!!写错了。找了很久。*/
            var endX = event.changedTouches[0].clientX;
            var disX = endX - startX;
            if (Math.abs(disX) < tabNavWidth / 2) {
                tabWrap.style.transition = '1s translateX';
                transformCss(tabWrap, 'translateX', -tabNavWidth);
            };

        });
    }
}


//無縫輪播
function banner() {
    /*這裡因為picWrap高度 ul寬度  li寬度是通過jsj加載過去的
    * 所以當圖片沒有加載完成，他們寬高為0  故會出現span上移動的操作
    * 這時把他們放在onload裡面
    * */


    //获取元素
    var wrap = document.getElementById('picWrap');
    var ulList = document.querySelector('#picWrap .list');
    transformCss(ulList,'translateZ',0.01);
    /*js生成两组图片*/
    ulList.innerHTML += ulList.innerHTML;
    var liNodes = document.querySelectorAll('#picWrap .list li');
    var spanNodes = document.querySelectorAll('#picWrap .indicator span');

    //布局样式
    var styleNode = document.createElement('style');
    styleNode.innerHTML += "#picWrap{height: " + liNodes[0].offsetHeight + "px;}";
    styleNode.innerHTML += "#picWrap .list{width: " + liNodes.length + "00%}";
    styleNode.innerHTML += "#picWrap .list li{width: " + (100 / liNodes.length) + "%}";
    document.head.appendChild(styleNode);

    /*初始元素位置*/
    var initX = 0;
    /*手指开始位置*/
    var startX;
    var startY;
    /*手指结束位置*/
    var endX;
    var endY;
    /*手指距离差*/
    var disX = 0;
    var disY = 0;
    /*自动轮播定时器*/
    var timer = null;
    /*图片索引统一*/
    var now = 0;
    /*防抖動兩個Boolean值---把move分为第一次和非第一次*/
    /*是否是第一次*/
    var isFirst = true;
    /*是否在X軸方向滑動*/
    var isX = true;

    wrap.addEventListener('touchstart', function (event) {
        //关闭定时器
        clearInterval(timer);

        //去除过渡
        ulList.style.transition = 'none';

        //无缝逻辑(这个逻辑一定放在其initX startX之前？？)--迅速跳转的。。
        var ulLeft = transformCss(ulList, 'translateX');
        now = Math.round(-ulLeft / document.documentElement.clientWidth);
        if (now == 0) {
            now = spanNodes.length;
        } else if (now == liNodes.length - 1) {
            now = spanNodes.length - 1;
        }
        transformCss(ulList, 'translateX', -now * document.documentElement.clientWidth);


        initX = transformCss(ulList, 'translateX');
        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;

        //重置
        isFirst = true;
        isX = true;

    });
    wrap.addEventListener('touchmove', function (event) {

        //禁止非第一次的touchmove逻辑
        if (!isX) {
            return
        }
        ;

        endX = event.changedTouches[0].clientX;
        endY = event.changedTouches[0].clientY;
        disX = endX - startX;
        disY = endY - startY;

        //防抖動邏輯判斷
        if (isFirst) {
            isFirst = false;
            if (Math.abs(disY) > Math.abs(disX)) {
                isX = false;
                return;  //是仅禁止第一次
            }
        }


        //确定距离
        transformCss(ulList, 'translateX', disX + initX);
    });
    wrap.addEventListener('touchend', function (event) {
        //图片的索引
        now = 0;
        //手指离开那一刻ul的left值
        var ulLeft = transformCss(ulList, 'translateX');
        now = Math.round(-ulLeft / document.documentElement.clientWidth);

        //两边的范围限定
        if (now < 0) {
            now = 0;
        } else if (now > liNodes.length - 1) {
            now = liNodes.length - 1;
        }
        //添加过渡
        ulList.style.transition = '.5s transform';
        //确定位置ul
        transformCss(ulList, 'translateX', -now * document.documentElement.clientWidth);
        //指示器
        for (var i = 0; i < spanNodes.length; i++) {
            spanNodes[i].className = '';
        }
        spanNodes[now % spanNodes.length].className = 'active';

        //开启定时器
        autoPlay();
    });

    //自动轮播逻辑
    autoPlay();

    function autoPlay() {
        timer = setInterval(function () {
            //自动轮播无缝逻辑
            if (now == liNodes.length - 1) {
                now = spanNodes.length - 1;
            }
            //解决最后一张迅速跳回来的过渡---渲染时间问题
            ulList.style.transition = 'none';
            transformCss(ulList, 'translateX', -now * document.documentElement.clientWidth);
            //作用是为了暂时停一下，让上面的先渲染完成（否则会覆盖操作）
            setTimeout(function () {
                now++;
                ulList.style.transition = '.5s transform';
                transformCss(ulList, 'translateX', -now * document.documentElement.clientWidth);
                //指示器
                for (var i = 0; i < spanNodes.length; i++) {
                    spanNodes[i].className = '';
                }
                spanNodes[now % spanNodes.length].className = 'active';
            }, 20);
        }, 2500);

    };
}


//點擊變色
function changeLisColor() {
    var liNodes = document.querySelectorAll('#wrap #content .conNav .conList li');

    /*第一層for循環就是為了給每個li註冊點擊事件*/
    for (var i = 0; i < liNodes.length; i++) {

        /*這裡問題：當S-M-E  這樣操作就會觸發點擊變色邏輯，而事實上是沒有的
        *當沒有touchmove是執行變色邏輯
        * 當有touchmove時不執行變色邏輯
        * 通過flag去判斷
        * */
        var flag = false;
        liNodes[i].addEventListener('touchmove', function () {
            //誤觸操作
            /*if(!flag){flag = true;}  與這個效果一樣*/
            flag = true;
        });


        /*點擊變色的邏輯肯定在touchend后的邏輯*/
        liNodes[i].addEventListener('touchend', function (event) {

            if (!flag) {
                /*這一層的for循環就是給每個liNodes操作--添加刪除類  或者用let --this--  */
                for (var j = 0; j < liNodes.length; j++) {
                    liNodes[j].className = '';
                }
                this.className = 'active';
            }
            flag = false;

        });
    }
}


//导航拖拽
function nav() {
    //获取元素
    /*conNav 就是与屏幕一样宽的   conList就是长长的ul*/
    var conNav = document.querySelector('#wrap #content .conNav');
    var conList = document.querySelector('#wrap #content .conNav .conList');
    transformCss(conList,'translateZ',0.01);
    //元素初始位置和手指开始位置
    var initX = 0;
    var startX;
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
    conNav.addEventListener("touchstart", function (event) {

        //清除過度
        conList.style.transition = 'none';

        //清除速度值，防止速度在（start-end邏輯）讀取上一次的speed。
        disPosition = 0;

        var touch = event.changedTouches[0];
        initX = transformCss(conList, "translateX");
        startX = touch.clientX;

        /*加速-開始位置-開始時間*/
        beginPosition = transformCss(conList, 'translateX');
        beginTime = new Date().getTime();
    });
    conNav.addEventListener("touchmove", function (event) {
        var touch = event.changedTouches[0];
        var endX = touch.clientX;
        var disX = endX - startX;
        var translateX = disX + initX;
        /*范围限定*/
        if (translateX > 0) {
            //橡皮筋右邊的
            var scale = 1 - translateX / document.documentElement.clientWidth;
            /*拋物線運動，峰值為375/2px*/
            translateX = 0 + translateX * scale;

        } else if (translateX < document.documentElement.clientWidth - conList.offsetWidth) {
            /*未成比例的留白區間-正值-*/
            var over = Math.abs(translateX) - (conList.offsetWidth - document.documentElement.clientWidth);
            var scale = 1 - over / document.documentElement.clientWidth;
            /*求新的tx=臨界值+over*scale--本身應該為負數*/
            translateX = document.documentElement.clientWidth - conList.offsetWidth - over * scale;
        }
        //確定位置
        transformCss(conList, "translateX", translateX);

        /*加速-結束位置-開始時間-間距位置-時間*/
        endPosition = translateX;
        endTime = new Date().getTime();
        disPosition = endPosition - beginPosition;
        disTime = endTime - beginTime;
    });

    /*加速邏輯--放在touchend---（兩邊）回彈的邏輯*/
    conNav.addEventListener("touchend", function () {
        /*speed--自帶正負-判斷其向左向右*/
        var speed = disPosition / disTime;

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
        var target = transformCss(conList, 'translateX') + speed * 100;

        //兩邊才需要回彈--回彈就是過渡加上貝塞爾曲線-cubic-bezier(0.08, 1.44, 0.6, 1.46)
        //如果是中間的話，是不需要回彈邏輯的。所以cubic不能直接寫(0.08, 1.44, 0.6, 1.46)
        var cubic = '';
        if (target > 0) {
            /*如果在左邊緣，回彈*/
            target = 0;
            cubic = 'cubic-bezier(0.08, 1.44, 0.6, 1.46)';
        } else if (target < document.documentElement.clientWidth - conList.offsetWidth) {
            target = document.documentElement.clientWidth - conList.offsetWidth;
            cubic = 'cubic-bezier(0.08, 1.44, 0.6, 1.46)';
        }
        ;

        //為UL添加過渡
        conList.style.transition = '1s ' + cubic;
        //確定距離
        transformCss(conList, 'translateX', target);
    });

}


//获取焦点和失去焦点逻辑
function getFocus() {
    /*因为刚取消了浏览器默认行为，故用js手动添加默认行为*/
    var inputNode = document.querySelector("#wrap #header .search input[type='text']");
    inputNode.addEventListener('touchstart', function (event) {
        //获取焦点
        this.focus();
        //取消冒泡到document而去执行失去焦点的逻辑  但在这里不需要阻止默认行为（因为本身就在添加浏览器的某个默认行为）
        event.stopPropagation();
    });

    document.addEventListener('touchstart', function (event) {
        //失去焦点
        inputNode.blur();
    });

}


//菜單點擊切换
function changeMenuBtn() {
    var mask = document.querySelector('#wrap #header .mask');
    var menuBtn = document.querySelector('#wrap #header .headerTop .menuBtn');
    /*true 表點擊將要打開mask*/
    var flag = true;
    menuBtn.addEventListener('touchstart', function (event) {
        if (flag) {
            tools.removeClass(this, 'menuBtnClose');
            tools.addClass(this, 'menuBtnOpen');
            mask.style.display = 'block';
        } else {
            tools.removeClass(this, 'menuBtnOpen');
            tools.addClass(this, 'menuBtnClose');
            mask.style.display = 'none';
        }
        flag = !flag;
        /*阻止mentBtn冒泡到document 以至於點擊一下馬上又關閉*/
        event.stopPropagation();
        /*阻止了冒泡，前面的阻止瀏覽器默認行為就失效了，故再次添加，为了阻止浏览器默认行为*/
        event.preventDefault();
    });
    document.addEventListener('touchstart', function () {
        if (!flag) {
            /*注意：这里不是this！！是menuBtn节点*/
            tools.removeClass(menuBtn, 'menuBtnOpen');
            tools.addClass(menuBtn, 'menuBtnClose');
            mask.style.display = 'none';
            flag = !flag;
        }

    });
    mask.addEventListener('touchstart', function (event) {
        /*取消冒泡，点击mask不会将其传递到document去执行点击事件*/
        event.stopPropagation();
        event.preventDefault();
    });
}







