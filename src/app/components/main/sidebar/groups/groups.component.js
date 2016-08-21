require('../../../../services/tagtypes.service');
require('../../modals/tag-types/tag-types.modal.component');
require('../../modals/groups/groups.modal.component');

var jessdocs = require('jessdocs');
jessdocs.component('groups', {
    require: {
        parent: '^^sidebar'
    },
    template: require('./groups.template.html'),
    controller: function($mdDialog, $tagtypes) {
       var self = this;
       self.$onInit = function(){
            $tagtypes.groups().then( function(response){
               self.groups = response;
            });
            
            $tagtypes.addCallback( function(){
                self.groups = $tagtypes.tagGroups;
            });
       };
        
        self.add = function(ev) {
            $mdDialog.show({
                template: '<tag-groups-modal layout="column"></tag-groups-modal>',
                targetEvent: ev,
                clickOutsideToClose:true,
            })
            .then(function(group) {
                $tagtypes.addGroup(group);
            }, function() {
            });
        };
        
        self.edit = function(group, ev) {
            if(self.parent.canWrite){
                $tagtypes.editingTagType = group;
                $mdDialog.show({
                    template: '<tag-groups-modal group="group" layout="column"></tag-groups-modal>',
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    locals: {group: group },
                    controller: function($scope, group) {
                      $scope.group = group;
                    }
                })
                .then(function(editedGroup) {
                    $tagtypes.editingTagType = null;
                    if(editedGroup.name != group.name 
                        || editedGroup.color != group.color){
                        $tagtypes.editGroup(editedGroup);   
                    }
                }, function() {
                });
            }
        };
    }
});