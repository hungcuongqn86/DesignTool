var gulp = require('gulp'), versionAppend = require('gulp-version-append');

/*
 gulp.task('version', function () {
 return gulp.src('./index.html')
 .pipe(versionAppend(['html', 'js', 'css'], {appendType: 'version', versionFile: './version.json'}))
 .pipe(gulp.dest('./dist/'));
 });
 */

gulp.task('timestamp', function () {
    return gulp.src('./index.html')
        .pipe(versionAppend(['html', 'js', 'css'], {appendType: 'timestamp'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['timestamp']);