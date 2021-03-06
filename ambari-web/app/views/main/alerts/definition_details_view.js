/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var App = require('app');
var filters = require('views/common/filter_view');
var sort = require('views/common/sort_view');

App.MainAlertDefinitionDetailsView = App.TableView.extend({

  templateName: require('templates/main/alerts/definition_details'),

  /**
   * Determines if <code>controller.content</code> is loaded
   * @type {bool}
   */
  isLoaded: false,

  /**
   * @type {string}
   */
  enabledDisplay: Em.I18n.t('alerts.table.state.enabled'),

  /**
   * @type {string}
   */
  disabledDisplay: Em.I18n.t('alerts.table.state.disabled'),

  colPropAssoc: ['serviceName', 'hostName', 'state'],

  /**
   * return filtered number of all content number information displayed on the page footer bar
   * @returns {String}
   */
  filteredContentInfo: function () {
    return Em.I18n.t('tableView.filters.filteredAlertInstancesInfo').format(this.get('filteredCount'), this.get('totalCount'));
  }.property('filteredCount', 'totalCount'),

  content: function () {
    return this.get('controller.alerts');
  }.property('controller.alerts.@each'),

  willInsertElement: function () {
    this._super();
    this.get('controller').clearStep();
    var self = this,
      updater = App.router.get('updateController');
    if (self.get('controller.content.isLoaded')) {
      self.set('isLoaded', true);
      self.get('controller').loadAlertInstances();
    }
    else {
      updater.updateAlertGroups(function () {
        updater.updateAlertDefinitions(function () {
          updater.updateAlertDefinitionSummary(function () {
            self.set('isLoaded', true);
            // App.AlertDefinition doesn't represents real models
            // Real model (see AlertDefinition types) should be used
            self.set('controller.content', App.AlertDefinition.find().findProperty('id', parseInt(self.get('controller.content.id'))));
            self.get('controller').loadAlertInstances();
          });
        });
      });
    }
  },

  didInsertElement: function () {
    this.filter();
    this.tooltipsUpdater();
  },

  /**
   * Update tooltips when <code>pageContent</code> is changed
   * @method tooltipsUpdater
   */
  tooltipsUpdater: function () {
    Em.run.next(function () {
      App.tooltip($(".enable-disable-button"));
    });
  }.observes('controller.content.enabled'),

  sortView: sort.wrapperView.extend({}),

  /**
   * Sorting header for <label>alertDefinition.label</label>
   * @type {Em.View}
   */
  serviceSort: sort.fieldView.extend({
    column: 0,
    name: 'serviceName',
    displayName: Em.I18n.t('common.service')
  }),

  /**
   * Sorting header for <label>alertDefinition.status</label>
   * @type {Em.View}
   */
  hostNameSort: sort.fieldView.extend({
    column: 1,
    name: 'hostName',
    displayName: Em.I18n.t('common.host')
  }),

  /**
   * Sorting header for <label>alertDefinition.service.serviceName</label>
   * @type {Em.View}
   */
  stateSort: sort.fieldView.extend({
    column: 2,
    name: 'state',
    displayName: Em.I18n.t('common.status')
  }),

  /**
   * Filtering header for <label>alertInstance.hostName</label>
   * @type {Em.View}
   */
  hostNameFilterView: filters.createTextView({
    column: 1,
    fieldType: 'input-medium',
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'string');
    }
  }),

  /**
   * Filtering header for <label>alertInstance.serviceName</label>
   * @type {Em.View}
   */
  serviceFilterView: filters.createSelectView({
    column: 0,
    fieldType: 'input-small',
    content: filters.getComputedServicesList(),
    onChangeValue: function () {
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'select');
    }
  }),

  /**
   * Filtering header for <label>alertInstance.state</label>
   * @type {Em.View}
   */
  stateFilterView: filters.createSelectView({
    column: 2,
    fieldType: 'filter-input-width',
    content: [
      {
        value: '',
        label: Em.I18n.t('common.all')
      },
      {
        value: 'OK',
        label: 'OK'
      },
      {
        value: 'WARNING',
        label: 'WARNING'
      },
      {
        value: 'CRITICAL',
        label: 'CRITICAL'
      },
      {
        value: 'UNKNOWN',
        label: 'UNKNOWN'
      },
      {
        value: 'PENDING',
        label: 'NONE'
      }
    ],
    onChangeValue: function () {
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'select');
    }
  }),

  /**
   * View calculates and represents count of alerts on appropriate host during last day
   */
  lastDayCount: Em.View.extend({
    hostName: '', // binding from template
    template: Ember.Handlebars.compile('<span>{{view.count}}</span>'),
    count: function () {
      var lastDayAlertsCount = this.get('parentView.controller.lastDayAlertsCount');
      return lastDayAlertsCount ? lastDayAlertsCount[this.get('hostName')] || 0 : Em.I18n.t('app.loadingPlaceholder');
    }.property('parentView.controller.lastDayAlertsCount', 'hostName')
  }),

  /**
   * View represents each row of instances table
   */
  instanceTableRow: Em.View.extend({
    tagName: 'tr',
    didInsertElement: function () {
      App.tooltip(this.$("[rel=tooltip]"));
      App.tooltip(this.$(".alert-text"), {
        placement: 'left',
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner alert-def-detail-tooltip"></div></div>'
      });
    },

    willDestroyElement: function() {
      this.$("[rel=tooltip]").tooltip('destroy');
      this.$(".alert-text").tooltip('destroy');
    },

    /**
     * Router transition to service page
     * @param event
     */
    goToService: function (event) {
      if (event && event.context) {
        App.router.transitionTo('main.services.service.summary', event.context);
      }
    },

    /**
     * Router transition to host level alerts page
     * @param {object} event
     * @method goToHostAlerts
     */
    goToHostAlerts: function (event) {
      if (event && event.context) {
        App.router.get('mainHostDetailsController').set('referer', App.router.location.lastSetURL);
        App.router.transitionTo('main.hosts.hostDetails.alerts', event.context);
      }
    },

    /**
     * open popup that contain full response of Alert Instance
     * @param {Object} event
     */
    openFullResponse: function(event) {
      App.ModalPopup.show({
        header: Em.I18n.t('alerts.instance.fullLogPopup.header'),
        secondary: null,
        content: event.context.get('text'),
        bodyClass: App.SelectablePopupBodyView
      });
    }

  }),

  paginationLeftClass: function () {
    if (this.get("startIndex") > 1) {
      return "paginate_previous";
    }
    return "paginate_disabled_previous";
  }.property("startIndex", 'filteredCount'),

  /**
   * Determines how display "next"-link - as link or text
   * @type {string}
   */
  paginationRightClass: function () {
    if (this.get("endIndex") < this.get("filteredCount")) {
      return "paginate_next";
    }
    return "paginate_disabled_next";
  }.property("endIndex", 'filteredCount'),

  /**
   * Show previous-page if user not in the first page
   * @method previousPage
   */
  previousPage: function () {
    if (this.get('paginationLeftClass') === 'paginate_previous') {
      this._super();
    }
  },

  /**
   * Show next-page if user not in the last page
   * @method nextPage
   */
  nextPage: function () {
    if (this.get('paginationRightClass') === 'paginate_next') {
      this._super();
    }
  }

});


App.AlertInstanceServiceHostView = Em.View.extend({

  templateName: require('templates/main/alerts/instance_service_host'),

  didInsertElement: function () {
    App.tooltip(this.$("[rel='UsageTooltip']"));
  },

  willDestroyElement: function() {
    this.$("[rel='UsageTooltip']").remove();
  },

  /**
   * Define whether show link for transition to service page
   */
  serviceIsLink: function () {
    return App.get('services.all').contains(this.get('instance.service.serviceName'));
  }.property('instance.service.serviceName'),

  /**
   * Define whether show separator between service and hosts labels
   */
  showSeparator: function () {
    return this.get('instance.serviceDisplayName') && this.get('instance.hostName');
  }.property('instance.serviceDisplayName', 'instance.hostName')

});