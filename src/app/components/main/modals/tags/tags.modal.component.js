require('../../../../services/specs.service');
require('../../../../services/tagtypes.service');

require('./tags.modal.scss');

var jessdocs = require('jessdocs');
jessdocs.component('tagsModal', {
    bindings: {
        spec: '<',
    },
    template: require('./tags.modal.template.html'),
    controller: function(
        $filter,
        $specs, 
        $tagtypes) {
        
        var self = this;
       self.formData = {};
       self.formData.tagTypes = [];
  
       self.$onInit = function() {
            $tagtypes.getTagTypes().then( function(response){
                self.tagTypesByGroup = response.byGroup;
                formatTagData();
            });
        };
       
        self.toggleTag = function(tagTypeId){
            var tag;
            if( (tag = self.hasTag(tagTypeId)) ){
                removeTag(tag);
            }
            else {
                addTag(tagTypeId);
            }
        };
        
        self.hasTag = function(tagTypeId){
            return _.find(self.spec.tag_types, {id: tagTypeId});
        };
        
        self.showGroupName = function(group){
            var name = group.name; 
            var any = $filter('filter')(group.tag_types, self.search);
            return name && any.length;
        };
        
        function addTag(tagTypeId){
            $specs.addTag(self.spec, tagTypeId).then(function (tag){
               self.spec.tag_types.push(tag.tag_type); 
               self.formData.tagTypes[tagTypeId] = true;
            });
        }
        
        function removeTag(tag){
            $specs.removeTag(tag, self.spec);
            _.pull(self.spec.tag_types, tag);
            self.formData.tagTypes[tag.id] = false;
        }
        
        function formatTagData(){
            self.spec.tag_types.forEach( function(tag){
                self.formData.tagTypes[tag.id] = true;
            });
        }   
       
    }
});