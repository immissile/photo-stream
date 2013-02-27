
(function() {

//photo stream test
var Photostream = {
   
    /**
     * 格式化日期
     */
    formatDate: function(now){
        var year=now.getFullYear(); 
        var month=now.getMonth()+1; 
        var date=now.getDate(); 
        return year+"-"+month+"-"+date; 
    },

    /**
     * 缩放并居中图片
     */
    setPosition : function(w,h){
        if(w > 160){
            //压缩宽度
            _w = 160;
            _h = (_w*h)/w;

            if(_h > 160){
                _w = (160*_w)/_h;
                _h = 160;
                _top = 0;
                _left = (160 - _w)/2;
            }else{
                _left = 0;
                _top = (160 - _h)/2
            }
        }else{
            if(h > 160){
                //宽不变，压缩高度
                _w = 160*w/h;
                _h = 160;
                _top = 0;
                _left = (160 - _w)/2
            }else{
                //左右居中，垂直居中
                _w = w;
                _h = h;
                _top = (160-h)/2;
                _left = (160-w)/2;
            }
        }

        _left = 0;//去掉该行，可使水平居中
        return {w:_w,h:_h,t:_top,l:_left}
    },

    /**
     * 图片列表排序
     */
    group : function(photos) {
        var fDate = function(t){
            return Photostream.formatDate(new Date(photos[t].time))
        }
        var curr_date = ''
        var new_arr = {};
        var tmp_arr = [];
        for(var i=0;i<photos.length;i++){
            _time = photos[i].time;
            _date = fDate(i)

            if(i==0){
                curr_date = fDate(i);
                tmp_arr.push(photos[i]);
                new_arr[curr_date] = tmp_arr;
            }else{
                if(curr_date == fDate(i)){
                    //如果与上一个相同，则继续装入第一个
                    tmp_arr.push(photos[i]);
                }else{
                    new_arr[curr_date] = tmp_arr;
                    tmp_arr = [];
                    //否则生成下一个key
                    curr_date = fDate(i);
                    tmp_arr.push(photos[i]);
                    new_arr[curr_date] = tmp_arr;
                }
            }
        }
        return new_arr;
    },

    /**
     * 渲染图片流模版
     */
    renderPhotos : function(o){
        var on_err_img = "http://icheshang.com:8081/pse/placeholder.png";
        var _html = '';
        for(key in o){
            var _list = '';
            for(k in o[key]){
                if(((parseInt(k))%5)==0){
                    _clear = "class='clear'";
                }else{
                    _clear = "";
                }
                var photo = o[key][k]
                p = Photostream.setPosition(photo.width, photo.height);
                _list += '<li '+ _clear +'>'+
                    '<div style="width:'+p.w+'px;height:'+p.h+'px;margin-top:'+p.t+'px;margin-left:'+p.l+'px;">'+
                        '<img src="'+ photo.imageURL +'" style="width:'+p.w+'px;height:'+p.h+'px;" onerror="this.src=\''+on_err_img+'\'">'+
                    '</div>'+
                    '</li>';
            }
            _html += '<div class="plist">'+
                '<h2>'+ key +'</h2>'+
                '<ul>'+ _list +'</ul>'+
            '</div>';
            _list = '';
        }

        $(".wrap").append(_html);
    },

    /**
     * 从某地址获取数据源
     */
    getPhotos : function(url, callback){
        //jsonp
        url += url.split('?').length == 1 ? "?callback=?" : "&callback=?";
        $.getJSON(url,function(o){
            var _r = {
                'list' : Photostream.group(o.photos),
                'nextURL' : o.nextURL
            }
            callback(_r)
        })
    },

    /**
     * 隐藏loading
     */
    loaderHide : function(){
        $(".loader").hide();
    },

    /**
     * 显示loading
     */
    loaderShow : function(){
        $(".loader").show();
    },
    
    /**
     * 滚动加载数据流
     */
    scrollRenderPhoto : function(){
        var doc_h = $(document).height();
        var win_h = $(window).height();
        var scroll_top_h = $(document).scrollTop();
        var h = doc_h - scroll_top_h - win_h;

        var next_url = NEXT_URL; 
        if(h < 100 && is_loading){
            is_loading = false;
            Photostream.loaderShow();
            Photostream.getPhotos(NEXT_URL,function(o){
                NEXT_URL = o.nextURL;
                Photostream.renderPhotos(o.list);
                is_loading = true;
                Photostream.loaderHide();
            })
        }
    }
}


var NEXT_URL = '', is_loading = true;
$(function(){
    
    //第一次抓数据
    first_url = "http://photo-sync.herokuapp.com/photos"
    Photostream.getPhotos(first_url, function(o){
        NEXT_URL = o.nextURL;
        Photostream.renderPhotos(o.list);
        Photostream.loaderHide();
    })

    //绑定滚动事件
    $(window).bind('scroll', Photostream.scrollRenderPhoto);

})


}).call(this);
