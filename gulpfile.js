const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const zip = require('gulp-zip');
/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

const SYSTEM_SCSS = ["scss/*.scss"];

function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: 'expanded'
  };
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass(options)
      .on('error', handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(["scss/**/*.scss"], css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  compileScss,
  watchUpdates
);
exports.css = css;
/* ----------------------------------------- */
/*  zipping a release
/* ----------------------------------------- */
let releaseVersion= '0.99'
let releaseFile='TorgEternityFVTTv'+releaseVersion+'.zip';
  gulp.task('zip', function () {

    return gulp.src([
      //---here i take my whole folder  
      '**/*.*',
      //then exclude all of these 
      '!node_modules/**',
      '!scss/**',
      '!release/**',
      '!gulpfile.js',
      '!merge-upstream.md',
      '!package-lock.json',
      '!package.json'
    ])
      .pipe(zip(releaseFile))
      .pipe(gulp.dest('./release'))
  })
