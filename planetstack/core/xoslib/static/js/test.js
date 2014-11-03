TestApp = new XOSApplication();

TestApp.addRegions({
    deploymentList: "#deploymentList",
    imageList: "#imageList",
    networkTemplateList: "#networkTemplateList",
    networkList: "#networkList",
    nodeList: "#nodeList",
    serviceList: "#serviceList",
    siteList: "#siteList",
    sliceList: "#sliceList",
    sliverList: "#sliverList",
    userList: "#userList",
    detail: "#detail",
    linkedObjs1: "#linkedObjs1",
    linkedObjs2: "#linkedObjs2",
    linkedObjs3: "#linkedObjs3",
    linkedObjs4: "#linkedObjs4"
});

TestApp.on("start", function() {
     var objs = ['deployment', 'image', 'networkTemplate', 'network', 'networkSliver', 'networkDeployment', 'node', 'service', 'site', 'slice', 'sliceDeployment', 'slicePrivilege', 'sliver', 'user', 'sliceRole', 'userDeployment'];

     for (var index in objs) {
         name = objs[index];
         tr_template = '#xosAdmin-' + name + '-listitem-template';
         table_template = '#xosAdmin-' + name + '-list-template';
         detail_template = '#xosAdmin-' + name + '-detail-template';
         collection_name = name + "s";
         region_name = name + "List";

         detailClass = Marionette.ItemView.extend({
            template: detail_template,
            tagName: 'div',

            events: {"click button.js-submit": "submitClicked",
                     "change input": "inputChanged"},

            /* inputChanged is watching the onChange events of the input controls. We
               do this to track when this view is 'dirty', so we can throw up a warning
               if the user tries to change his slices without saving first.
            */

            inputChanged: function(e) {
                this.dirty = true;
            },

            saveError: function(model, result, xhr) {
                TestApp.showError(result);
            },

            saveSuccess: function(model, result, xhr) {
                TestApp.showSuccess({status: xhr.xhr.status, statusText: xhr.xhr.statusText});
            },

            submitClicked: function(e) {
                TestApp.hideError();
                e.preventDefault();
                var data = Backbone.Syphon.serialize(this);
                var thisView = this;
                this.model.save(data, {error: function(model, result, xhr) { thisView.saveError(model, result, xhr); },
                                       success: function(model, result, xhr) { thisView.saveSuccess(model, result, xhr); }});
                this.dirty = false;
            },
         });

         itemViewClass = Marionette.ItemView.extend({
             detailClass: detailClass,
             template: tr_template,
             tagName: 'tr',
             className: 'test-tablerow',

             events: {"click": "changeItem"},

             changeItem: function(e) {
                    TestApp.hideError();
                    e.preventDefault();
                    e.stopPropagation();

                    index=0;
                    for (relatedName in this.model.collection.relatedCollections) {
                        relatedField = this.model.collection.relatedCollections[relatedName];

                        relatedListViewClassName = relatedName + "ListView";
                        if (TestApp[relatedListViewClassName] == undefined) {
                            console.log("warning: " + relatedListViewClassName + " not found");
                        }
                        relatedListViewClass = TestApp[relatedListViewClassName].extend({collection: xos[relatedName].filterBy(relatedField,this.model.id)});
                        TestApp["linkedObjs" + (index+1)].show(new relatedListViewClass());
                        index = index + 1;
                    }

                    while (index<4) {
                        TestApp["linkedObjs" + (index+1)].empty();
                        index = index + 1;
                    }

                    var detailView = new this.detailClass({
                        model: this.model,
                    });
                    $('#detailBox').show();
                    TestApp.detail.show(detailView);
              },
         });

         listViewClass = Marionette.CompositeView.extend({
             childView: itemViewClass,
             childViewContainer: 'tbody',
             template: table_template,
             collection: xos[collection_name],
             title: name + "s",

             initialize: function() {
                 this.listenTo(this.collection, 'change', this._renderChildren)

                 // Because many of the templates use idToName(), we need to
                 // listen to the collections that hold the names for the ids
                 // that we want to display.
                 for (i in this.collection.foreignCollections) {
                     foreignName = this.collection.foreignCollections[i];
                     if (xos[foreignName] == undefined) {
                         console.log("Failed to find xos class " + foreignName);
                     }
                     this.listenTo(xos[foreignName], 'change', this._renderChildren);
                     this.listenTo(xos[foreignName], 'sort', this._renderChildren);
                 }
             },

             templateHelpers: function() {
                return { title: this.title };
             },
         });
         TestApp[collection_name + "ListView"] = listViewClass;

         var listView = new listViewClass();

         if (region_name in TestApp.getRegions()) {
             TestApp[region_name].show(listView);
         }
         xos[collection_name].fetch(); //startPolling();
     }

     $('#close-detail-view').unbind().bind('click', function() {
         $('#detailBox').hide();
     });
});

$(document).ready(function(){
    TestApp.start();
});
