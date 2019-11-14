var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node;
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var liquid = require('gulp-liquid');
var path = require('path');
var rename = require("gulp-rename");
var sort = require("gulp-sort");
var fs = require("fs");
var gulpif = require('gulp-if');

var develop = true;

gulp.task('client-compile-js', 
    gulp.series(
        function() {
            return gulp.src( 'game_modules/client/modules/**/*.html' )
                .pipe(concat('client.tpl.html'))
                .pipe(gulp.dest( 'game_modules/_tmp/' )); // save client.tpl.html
        },
        function() {
            var tpl = fs.readFileSync( 'game_modules/_tmp/client.tpl.html', "utf-8" );

            return gulp.src( 'game_modules/admin/templates.js' )
                .pipe(liquid({
                    locals: {html: tpl.replace(/(\r\n|\n|\r)/gm,"").replace(/'/gm,"\\'").replace(/[\t\s]+/gm," ")}
                }))
                .pipe(rename('client.tpl.js'))
                .pipe(gulp.dest( 'game_modules/_tmp/' )); // save client.tpl.html
        }, function() {
            return gulp.src( [
                    'game_modules/_tmp/client.tpl.js',
                    'game_modules/client/core/*.js',
                    'game_modules/client/modules/**/*.js'
                ] )
                .pipe(gulpif(develop, sourcemaps.init()))
        //        .pipe(plumber())
                .pipe(sort())
                .pipe(concat('client.js'))
        //        .pipe(sourcemaps.write('maps'))
        //        .pipe(gulp.dest( 'public/j/' )) // save client.js
                .pipe(gulpif(!develop, uglify({ preserveComments: 'license' })))
        //        .pipe(rename({ extname: '.min.js' }))
                .pipe(gulpif(develop, sourcemaps.write('maps')))
                .pipe(gulp.dest( 'public/j/' )); // save client.min.js
        }
    )
);

gulp.task('index-compile-tpl', 
    gulp.series(
        function() {
            return gulp.src( 'game_modules/pages/templates/**/*.html' )
                .pipe(concat('index.tpl.html'))
                .pipe(gulp.dest( 'public/j/' )); // save client.tpl.html
        },
        function() {
            var tpl = fs.readFileSync( 'public/j/index.tpl.html', "utf-8" );

            return gulp.src( 'game_modules/admin/templates.js' )
                .pipe(liquid({
                    locals: {html: tpl.replace(/(\r\n|\n|\r)/gm,"").replace(/'/gm,"\\'").replace(/[\t\s]+/gm," ")}
                }))
                .pipe(rename('index.tpl.js'))
                .pipe(gulpif(!develop, uglify({ preserveComments: 'license' })))
                .pipe(gulp.dest( 'public/j/' ));
        }
));

gulp.task('admin-compile-js', 
    gulp.series(function() {
        return gulp.src( 'game_modules/admin/modules/**/*.html' )
            .pipe(concat('admin.tpl.html'))
            .pipe(gulp.dest( 'game_modules/_tmp/' )); // save admin.tpl.html
    }, 
    function() {
        var tpl = fs.readFileSync( 'game_modules/_tmp/admin.tpl.html', "utf-8" );

        return gulp.src( 'game_modules/admin/templates.js' )
            .pipe(liquid({
                locals: {html: tpl.replace(/(\r\n|\n|\r)/gm,"").replace(/'/gm,"\\'").replace(/[\t\s]+/gm," ")}
            }))
            .pipe(rename('admin.tpl.js'))
            .pipe(gulp.dest( 'game_modules/_tmp/' )); // save admin.tpl.html
    },  
    function() {
        return gulp.src( [
                'game_modules/_tmp/admin.tpl.js',
                'game_modules/admin/core/*.js',
                'game_modules/admin/modules/**/*.js'
            ] )
            .pipe(gulpif(develop, sourcemaps.init()))
    //        .pipe(plumber())
            .pipe(sort())
            .pipe(concat('admin.js'))
    //        .pipe(sourcemaps.write('maps'))
    //        .pipe(gulp.dest( 'public/j/' )) // save admin.js
            .pipe(gulpif(!develop, uglify({ preserveComments: 'license' })))
    //        .pipe(rename({ extname: '.min.js' }))
            .pipe(gulpif(develop, sourcemaps.write('maps')))
            .pipe(gulp.dest( 'public/j/' )); // save admin.min.js
    })
);

gulp.task('compile', 
    gulp.series('admin-compile-js', 
        'client-compile-js', 
        'index-compile-tpl',
        function (done) {
            gulp.watch(['game_modules/client/**/*.js','game_modules/client/**/*.html'], gulp.series('client-compile-js'));
            gulp.watch(['game_modules/admin/**/*.js','game_modules/admin/**/*.html'], gulp.series('admin-compile-js'));
            gulp.watch(['game_modules/pages/templates/**/*.html'], gulp.series('index-compile-tpl'));
            
            done();
}));

var nodeStart = function(){
    node = spawn('node', ['server.js'], {stdio: 'inherit', env: { 'NODE_ENV': develop?'development':'prod' }});
    node.on('close', function (code) {
        console.log('server now killed... restart server!', code);
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
        node = null;
        
        nodeStart();
    });
};

gulp.task('server', function() {
    if (node){ 
        console.log('server now killed... restart server!');
        
        node.kill('SIGINT');
    }else{
        nodeStart();
    }
    
    return node;
});

gulp.task('run', 
    gulp.series('compile', 
        gulp.parallel('server', function (done) {
            gulp.watch(['server.js', 'game_modules/server/**/*.js'], gulp.series('server'));

            done();
    }))
);

gulp.task('run-prod', gulp.series(function (done) {develop = false;done();}, 'compile', 'server', function (done) {
    gulp.watch(['server.js', 'game_modules/server/**/*.js'], gulp.series('server'));
    
    done();
}));

process.on('exit', function() {
    if (node) node.kill('SIGINT');
});
