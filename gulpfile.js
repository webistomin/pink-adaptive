"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
var run = require("run-sequence");
var del = require("del");
var cleanCSS = require("gulp-clean-css");
var minifyjs = require("gulp-js-minify");

const imageminFormat = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminOptipng = require("imagemin-optipng");

imageminFormat(["img/*.jpg"], "build/img", { use: [imageminJpegtran()] }).then(() => {
    console.log("img optimized");
});

imageminFormat(["img/*.png"], "build/img", { use: [imageminOptipng()] }).then(() => {
    console.log("img optimized");
});

gulp.task("style", function() {
    gulp.src("less/style.less")
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
            autoprefixer({ browsers: ["last 2 versions"] }),
            mqpacker({ sort: true })
        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("serve", function() {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("less/**/*.{less,less}", ["style"]);
    gulp.watch("*.html", ["html:update"]);
});

gulp.task("img", function() {
    return gulp.src("build/img/**/*.{png,jpg,gif}")
        .pipe(imagemin([
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.jpegtran({ progressive: true })
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
    return gulp.src("build/img/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("build", function(fn) {
    run("clean", "copy", "style", "img", "symbols", fn);
});

gulp.task("copy", function() {
    return gulp.src([
            "fonts/**/*.{woff,woff2}",
            "img/**",
            "js/**",
            "*.html",
            "*.png"
        ], {
            base: "."
        })
        .pipe(gulp.dest("build/"));
});

gulp.task("clean", function() {
    return del("build");
});

gulp.task("html:copy", function() {
    return gulp.src("*.html")
        .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
    server.reload();
    done();
});

gulp.task("minify-css", function() {
    return gulp.src("styles/*.css")
        .pipe(cleanCSS({ compatibility: "ie8" }))
        .pipe(gulp.dest("dist"));
});

gulp.task("minify-js", function() {
    gulp.src("./dist/a.js")
        .pipe(minifyjs())
        .pipe(gulp.dest("./dist/"));
});