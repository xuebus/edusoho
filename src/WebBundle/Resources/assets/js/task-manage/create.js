class Editor {
    constructor($modal) {
        var $editor = $modal.find('#task-editor');
        this.mode = $editor.data('editorMode');
        this.elem = $modal;
        this.type = $editor.data('editorType');
        this.step = 1;
        this.validator = null;
        this.loaded = false;
        this._init();
        this._initEvent();
        this._contentUrl = '';
        this._saveUrl = $editor.data('saveUrl');
    }

    _initEvent() {
        $(this.elem).on('click', '#course-tasks-next', this._onNext.bind(this));
        $(this.elem).on('click', '#course-tasks-prev', this._onPrev.bind(this));
        $(this.elem).on('click', '.js-course-tasks-item', this._onSetType.bind(this));
        $(this.elem).on('click', '#course-tasks-submit', this._onSave.bind(this));
    }

    _init() {
        if (this.mode === 'edit') {
            this._contentUrl = $("#task-editor").data('editorStep2Url');
            this.step = 2;
            this._switchPage();
        }
    }

    _onNext(e) {
        if (this.step >= 3) {
            return;
        }
        if(this.step != 1  && !this._validator(this.step)) {
            return;
        }
        this.step++;
        this._switchPage();
    }

    _onPrev() {
        if (this.step <= 1 || (this.mode === 'edit' && this.step <= 2)) {
            return;
        }
        if(this.step != 1 && !this._validator(this.step)) {
            return;
        }
        this.step--;
        this._switchPage();
    }

    _onSetType(e) {
        var $this = $(e.currentTarget).addClass('active');
        $this.siblings().removeClass('active');
        $('#course-tasks-next').removeAttr('disabled');
        var type = $this.find('a').data('type');
        $('[name="mediaType"]').val(type);
        this._contentUrl = $this.find('a').data('contentUrl');
        if (this.type !== type) {
            this.loaded = false;
            this.type = type;
        }
    }

    _onSave() {
        if(!this._validator(this.step)) {
            return;
        }
        let self = this;
        var postData = $('.js-hidden-data')
            .map((index, node) => {
                var name = $(node).attr('name');
                var value = $(node).val();
                return {name: name, value: value}
            })
            .filter((index, obj) => {
                return obj.value !== '';
            })
            .get()
            .concat($('#step2-form').serializeArray())
            .concat($("#step3-form").serializeArray())
            .concat([
                {name: 'mediaType', value: this.type}
            ]);

        $.post(this._saveUrl, postData)
            .done((response) => {
                self.elem.modal('hide');
            })
            .fail((response) => {

            });
    }

    _switchPage() {
        var _self = this;
        var step = this.step;
        if (step == 1) {
            $("#task-type").show();
            $(".js-step2-view").removeClass('active');
            $(".js-step3-view").removeClass('active');
        } else if (step == 2) {
            $("#task-type").hide();
            $(".js-step2-view").addClass('active');
            $(".js-step3-view").removeClass('active');
            !this.loaded && $('.tab-content').load(this._contentUrl, function () {
                _self._initStep2();
            });
        } else if (step == 3) {
            $(".js-step3-view").addClass('active');
            $(".js-step2-view").removeClass('active');
            _self._initStep3();
        }
    }

    _initStep2() {
        this.loaded = true;
        $('#task-type').data('step2_form',$('#step2-form'));
        $('#task-type').data('step3_form',$('#step3-form'))
    }
    _initStep3() {
        $('#task-type').data('step3_form',$('#step3-form'))
    }
    _validator(index) {
        var validator = $('#task-type').data('validator'+index);
        var validatorArray = $('#task-type').data('validatorArray'+index);
        var isvalidator;
        for(var i= 0;i<validatorArray.length;i++) {
            isvalidator = validator.element(validatorArray[i]);
            if(!isvalidator) {
                break;
            }
        }
        if(!isvalidator) {
            return false;
        }
        return true;
    }
}

new Editor($('#modal'));