var gulp = require('gulp');

gulp.task('build', copyFunction);

function copyFunction ()
{
    return gulp
        .src(['./public/dist/*', './public/dist/**/*', './public/dist/**/**/*'])
        .pipe(gulp.dest('public'));
}

gulp.task('default', ['build']);