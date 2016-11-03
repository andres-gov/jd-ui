require('../../services/projects.service');
require('../../services/breadcrumbs.service');
require('../../services/params.service');
require('../../services/specs.service');
require('../../services/users.service');
require('../../services/tagtypes.service');
require('../../services/api.service');

require('./specs/specs.component');
require('../header/header.component');
require('./sidebar/sidebar.component');
require('./fab/fab.component');

require('./main.scss');

var jessdocs = require('jessdocs');
export const main = {
    template: require('./main.template.html'),
    controller: function(
        $auth,
        $q,
        $api,
        $projects,
        BreadcrumbsService,
        ParamService,
        $specs,
        $user,
        $tagtypes,
        spinnerService,
        $state,
        $stateParams) {
       var self = this;
       
       self.canWrite = false;
       self.introOptions = {
          showStepNumbers: false,
          showBullets: false,
          showProgress: false,
          nextLabel: 'next',
          hideNext: true,
          tooltipPosition: 'auto',
          disableInteraction: true,
          steps:[
            {
              intro: require('./introjs/welcome.html')
            },
            {
              intro: require('./introjs/usage.html')
            },
            {
              element: '#fab',
              intro: "Click the + button to add your first specs.",
              position: 'auto'
            },
            {
              element: '#filterPanel',
              intro: "Filtering is the default selected panel. Filtering by a tag " +
                "will display all specs that have that tag, as well as all parents and children of that spec. " +
                "You can also filter by specs that have tickets or comments associated with them.",
              position: 'auto'
            },
            {
              element: '#sidebarMenu',
              intro: "Change the panel content using the sidebar menu.",
              position: 'auto'
            },
            {
              element: '#sidebarBookmarks',
              intro: "Easily navigate back to a particular tree in the test suite using bookmarks.",
            },
            {
              element: '#sidebarTags',
              intro: "Add, remove, and update your tags using this panel.",
            },
            {
              element: '#sidebarGroups',
              intro: "Add groups to logically organize your tags (e.g., RC10 features)",
            },
            {
              element: '#sidebarProjects',
              intro: "Separate groups of self-contained test suites by creating projects.",
            },
            {
              element: '#spec-list',
              intro: "View your specs in the main panel.",
              position: 'auto'
            },
            {
              element: '#spec',
              intro: "Double click a spec to edit it.<br/>" + 
                "Drag and drop to reorder. <br>" +
                "Mouseover a spec " +
                "to see the menu button, which you can click to " +
                "add children, tags, and comments",
              position: 'auto'
            },
            {
              intro: "<p class='md-headline welcome'>And much more!</p>",
            }
          ]
        };
        
        self.reloadIntroElems = function(){
          
          var intro = this;
          
          for (var i = intro._currentStep+1; i < this._options.steps.length; i++) {
            var currentItem = intro._introItems[i];
            var step = intro._options.steps[i];
            if (step.element) {
              currentItem.element = document.querySelector(step.element);
              currentItem.position = step.position;
            }
          }
        };
        
        self.toggleIntroOff = function(){
          $user.toggleIntroOff();
        };
        
       self.$onInit = function(){
            
            sanitizeOrgParam($stateParams.orgId);
            self.canWrite = $user.write();
            var project;
            
            var promises = {
                tickets: $api.request({url: '/tickets'}),
                tags: $api.request({url: '/tags'}),
                projects: $projects.getProjects(),
                tagTypes: $tagtypes.getTagTypes(),
                breadcrumbs: BreadcrumbsService.initBreadcrumbsFromId($stateParams.spec_id)
            };
            
            $q.all(promises).then( function(response) {
                self.tickets = response.tickets;
                self.tags = response.tags;
                project = sanitizeProjectParam($stateParams.projectId);
                var tagTypes = $tagtypes.sanitizeTagTypes($stateParams.tag_type, true);
                return tagTypes;
            }).then( function(response){
                var params = ParamService.parseParamsFromURL(project.id, response);
                return $specs.setSpecList(params);
            }).finally( function(specs){
              self.specs = specs;
              spinnerService.hide('spinner');
              if($user.user().user_setting.show_intro){
                self.startTour();
              }
            });
            
            $user.addOrgCallback( function(){
              spinnerService.show('spinner');
                $tagtypes.updateGroups();
                $tagtypes.updateTagTypes();
                BreadcrumbsService.clearBreadcrumbs();
               $projects.updateProjects().then( function(response){
                   $projects.setCurrentProject(response[0]);
                   return response;
               }).then( function(projects){
                   ParamService.changeOrg($user.currentOrg().id, $projects.project().id);
                   self.canWrite = $user.write(); 
                   return $specs.setSpecList({project_id: $projects.project().id});
               }).finally ( function(){
                 spinnerService.hide('spinner');
               });
               
            });
            
       };
       
       function sanitizeProjectParam(id){
           var project = _.find($projects.projects, {id: id});
           if(!project){
               project = $projects.projects[0];
               ParamService.updateURL({projectId: project.id});
           }
        //   $projects.currentProject = project;
            $projects.setCurrentProject(project);
           return project;
       }
       
       function sanitizeOrgParam(id){
           var org = _.find($user.organizations(), {id: id});
           if(!org){
               org = $user.organizations()[0];
               ParamService.updateURL({orgId: org.id});
           }
           $user.initOrg(org);
           
       }
       
    }
}
jessdocs.component('main', main);