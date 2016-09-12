require('../../../services/api.service');
require('../../../services/specs.service');
require('../../../services/menu.service');

require('./breadcrumbs/breadcrumbs.component');
require('./spec/spec.component');
require('./specs2.component.jsx');

require('./specs.scss');

require('../../../directives/sortable');

var jessdocs = require('jessdocs');
jessdocs.component('specs', {
    require: {
        parent: '^^main'
    },
     template: require('./specs.template.html'),
     controller: function(
        $anchorScroll,
        $location,
        $q, 
        $scope, 
        $api,
        $specs,
        MenuService) {
        var self = this;
        
        self.export = false;
        self.exportSpecs = [];
        self.editingSpec;
        self.dragging = false;
        
        self.sortableOpts = {
          handle: '.drag-handle',
          containerPath: '> spec > div',
          delay: 500,
          onDragStart: function($item, container, _super) {
            self.dragging = true;
            _super($item, container);
          },
          onDrop: function($item, container, _super) {
            self.dragging = false;
            var newIndex = $item.index();
            var specId = $item.attr('data-spec-id');
            var parentId = container.el.attr('data-parent-id');
            var prevId;
            if (newIndex > 0) {
                prevId = $item.prev().attr('data-spec-id');
            }
            $specs.move(specId, parentId, prevId);
            _super($item, container);
          }
        };
        
        self.treeOpts = {
            beforeDrop : function (e) {
                return true;
            },
            beforeDrag: function(sourceNodeScope){
                self.dragging = true;
                return true;
            },
            dropped: function(e){
                console.log('drag event', e)
                parseMove(e);
                //spec id: e.source.nodeScope.$modelValue.id
                //need parent
                //parent spec id: e.dest.nodeScope.$parent.$ctrl.spec.id)
                //need prev sibling
                //dropped index (relative to parent):
                //e.dest.index
                //value of previous sibling
                //e.dest.nodeScope.$modelValue[index-1].id
                return true;
            }
        };
        
        function parseMove(e){
            self.dragging = false;  
            var specId = e.source.nodeScope.$modelValue.id;
            var newIndex = e.dest.index;
            var siblingId;
            if(newIndex > 0){
                siblingId = e.dest.nodesScope.$modelValue[newIndex-1].id;
            }
            var parentId = null;
            if(e.dest.nodesScope.$parent.$ctrl.spec){
                parentId = e.dest.nodesScope.$parent.$ctrl.spec.id;
            }
            
            $specs.move(specId, parentId, siblingId);
        }
        
        self.toggleExport = function(spec){
            var idx = self.exportSpecs.indexOf(spec);
            if (idx > -1) {
                recursiveCheck(spec, false);
            }
            else {
                recursiveCheck(spec, true);
            }
        };
        
        function recursiveCheck(spec, checked){
            var idx = self.exportSpecs.indexOf(spec);
            
            if (idx <= -1 && checked) {
                //if already in array, don't add twice
                self.exportSpecs.push(spec);
            }
            else if (idx > -1 && !checked){
                self.exportSpecs.splice(idx, 1);
            }
            
            spec.children.forEach( function(child){
                recursiveCheck(child, checked); 
            });
            
        }
        
       self.$onInit = function(){
           
           MenuService.addCallback( function(){
                self.addChildren = MenuService.addChildren;
                $location.hash('bottom');
                $anchorScroll();
           });
           
           MenuService.addExportCallback( function(){
               self.export = MenuService.export;
               if( self.export === false ){
                   MenuService.exportSpecs = self.exportSpecs;
                   self.exportSpecs = [];
               }
           });
           
           self.spec = $specs.specs;
           $specs.addCallback(function callback() {
                self.spec = $specs.specs;
            });
            
       };
        
        self.checked = function(spec){
            return _.includes(self.exportSpecs, spec);
        }
        
      self.toggleEdit = (spec) => {
        if(self.editingSpec){
          self.editingSpec.editing = false;
        }
        self.editingSpec = spec;
        spec.editing = true;
        spec.userMouseover = false;
      };
      
      self.saveEdit = (spec, description) => {
        if(spec.description !== description){
          spec.description = description;
          $specs.editDescription(spec);
        }
        spec.editing = false;
      }
       
     }
});