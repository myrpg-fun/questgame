admin.fields.NewClassesCollection = new SchemeCollection([]);
admin.fields.NewClasses = makeSchemeFieldList(
    admin.fields.NewClassesCollection
);

admin.fields.ArgumentRelation = {};

admin.fields.NewAction = makeSchemeFieldList(
    admin.fields.NewActionCollection = new SchemeCollection([])
);

admin.fields.CopyBuffer = [];
admin.fields.CopyBufferArgs = [];

admin.fields.NewActionCollection.add([
    admin.fields.PasteField = new PasteButtonField()
]);

admin.fields.NewArguments = makeSchemeFieldList(new SchemeCollection([
    makeSchemeFieldList(admin.fields.NewArgumentsCollection = new SchemeCollection([])),
    makeSchemeFieldList(admin.fields.NewArgumentsClasses = new SchemeCollection([])),
]));

admin.fields.NewPlayerInterface = makeSchemeFieldList(
    admin.fields.NewPlayerInterfaceCollection = new SchemeCollection([])
);
