var Dummy = SyncedData.extend({
    moduleName: 'Dummy',
    createAttrs: function(){}
});

admin.SyncedData = Dummy.extend({
    className: 'SyncedData'
});

admin.AllPlayers = Dummy.extend({
    className: 'AllPlayers'
});

admin.SessionTime = Dummy.extend({
    className: 'SessionTime'
});

admin.PlayerWatcher = Dummy.extend({
    className: 'PlayerWatcher'
});

admin.PlayerNotificationsList = Dummy.extend({
    className: 'PlayerNotificationsList'
});

admin.MapCoordinates = Dummy.extend({
    className: 'MapCoordinates'
});

admin.MapMarkerTriggerClickListener = Dummy.extend({
    className: 'MapMarkerTriggerClickListener'
});

admin.DialogFieldList = Dummy.extend({
    className: 'DialogFieldList'
});

admin.PlayerDialogInterfaceView = Dummy.extend({
    className: 'PlayerDialogInterfaceView'
});

admin.SessionSettingName = Dummy.extend({
    className: 'SessionSettingName'
});

admin.SessionSettingDenied = Dummy.extend({
    className: 'SessionSettingDenied',
});

admin.SessionSettingSetupField = Dummy.extend({
    className: 'SessionSettingSetupField',
});

admin.SessionSettingJoinField = Dummy.extend({
    className: 'SessionSettingJoinField',
});