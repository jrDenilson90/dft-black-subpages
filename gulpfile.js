const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const wrap = require('gulp-wrap');
const through = require('through2');
const cheerio = require('gulp-cheerio');
const flatten = require('gulp-flatten');
const path = require('path');
const fs = require('fs');
const sassCompiler = require('sass'); // para compilar overrides .scss
const gulpTerser = require('gulp-terser');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

// Importa os caminhos dos scripts do imports.js
const scriptPaths = require('./src/script/imports.js');

// Caminhos
const paths = {
    pug: { src: 'src/index.pug', dest: 'dist/' },
    sass: { src: 'src/**/main.scss', watch: 'src/**/*.scss', dest: 'dist' },
    js: { dest: 'dist/js/' },
    externalJs: { src: 'src/scriptExternal/**/*.js', dest: 'dist/external/' },
    stylesRaw: { src: 'src/styles/**/*.css', dest: 'dist/styles/' },
    production: { dest: 'bob/' }
};

// ------------------------ Build normal (gera dist/) ------------------------

gulp.task('clean', () => del(['dist/**', '!dist']));

gulp.task('pug', () =>
    gulp.src(paths.pug.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream())
);

gulp.task('sass', () =>
    gulp.src(paths.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.sass.dest))
        .pipe(browserSync.stream())
);

// Copia arquivos .css "puros" (overrides exceto overrides.*) para dist sem processamento
gulp.task('copy-css', () => {
    // Ignora arquivos overrides.<env>.css|scss — esses serão injetados somente no build de produção
    return gulp.src(['src/styles/**/*.css', '!src/styles/overrides.*.css'], { allowEmpty: true })
        .pipe(gulp.dest(paths.stylesRaw.dest));
});

gulp.task('js', () =>
    gulp.src([
        ...scriptPaths.main,
        ...scriptPaths.templates,
        ...scriptPaths.components
    ])
        .pipe(through.obj((file, enc, cb) => {
            console.log('Processing file:', file.path);
            cb(null, file);
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        .pipe(concat('main.js'))
        .pipe(wrap('<%= contents %>'))
        // .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(browserSync.stream())
);

gulp.task('externalJs', () =>
    gulp.src(paths.externalJs.src)
        .pipe(sourcemaps.init())
        .pipe(concat('external.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.externalJs.dest))
        .pipe(browserSync.stream())
);

// Atualiza a task build para incluir copy-css (garante que .css puros vão para dist)
gulp.task('build', gulp.series('clean', 'pug', 'sass', 'copy-css', 'js', 'externalJs'));

// ------------------------ Produção por país (gera bob/<country>/) ------------------------

function productionDestFor(country) {
    return path.join(paths.production.dest, country.toLowerCase());
}

function cleanProductionFor(country) {
    const dest = productionDestFor(country);
    return del([path.join(dest, '**'), `!${dest}`]);
}

function htmlProductionFor(country) {
    const dest = productionDestFor(country);
    return gulp.src('dist/*.html')
        .pipe(cheerio({
            run: function ($) {
                const dafitiContent = $('.dafitiStructure').html();
                $.root().html(`<div class="dafitiStructure">${dafitiContent || ''}</div>`);
            },
            parserOptions: { xmlMode: false }
        }))
        .pipe(htmlmin({ 
            collapseWhitespace: true,            // pode manter true
            collapseInlineTagWhitespace: false,  // DESATIVE isso
            conservativeCollapse: true,          // opcional: preserva 1 espaço em colapsos
            removeComments: true,
            removeAttributeQuotes: false,
        }))
        
        .pipe(gulp.dest(dest));
}

// Injeta CSS final com overrides por país
function cssProductionFor(country) {
    const dest = productionDestFor(country);
    const c = country.toLowerCase();

    const overrideCssPath = path.join(__dirname, 'src', 'styles', `overrides.${c}`);

    let overrideContent = '';

    if (fs.existsSync(overrideCssPath)) {
        try {
            overrideContent = fs.readFileSync(overrideCssPath, 'utf8');
            console.log(`[gulp] usando override CSS: ${overrideCssPath}`);
        } catch (err) {
            console.warn(`[gulp] falha ao ler override CSS ${overrideCssPath}:`, err.message);
        }
    } else {
        // tenta também em dist/styles (caso já tenha sido copiado)
        const distOverrideCss = path.join(__dirname, 'dist', 'styles', `overrides.${c}`);
        if (fs.existsSync(distOverrideCss)) {
            try {
                overrideContent = fs.readFileSync(distOverrideCss, 'utf8');
                console.log(`[gulp] usando override já copiado em dist: ${distOverrideCss}`);
            } catch (err) {
                console.warn(`[gulp] falha ao ler override em dist ${distOverrideCss}:`, err.message);
            }
        } else {
            console.log(`[gulp] nenhum override encontrado para ${c} (procurado: overrides.${c} em src/styles ou dist/styles)`);
        }
    }

    return gulp.src('dist/**/*.css')
        .pipe(through.obj((file, enc, cb) => {
            const cssContent = file.contents.toString(enc);

            const wrappedContent =
                `${overrideContent}
                <style>
                    ${cssContent}
                </style>`;
            file.contents = Buffer.from(wrappedContent, enc);
            cb(null, file);
        }))
        .pipe(flatten())
        .pipe(gulp.dest(dest));
}

function compactCssFor(country) {
    const dest = productionDestFor(country);
    return gulp.src(path.join(dest, '*.css'))
        .pipe(replace(/\s+/g, ' '))
        .pipe(replace(/\s*{\s*/g, '{'))
        .pipe(replace(/\s*}\s*/g, '}'))
        .pipe(replace(/\s*:\s*/g, ':'))
        .pipe(replace(/\s*;\s*/g, ';'))
        .pipe(gulp.dest(dest));
}

// ------------------------ JS Production SEM overrides por país ------------------------

function getJsOverrideFor(country) {
    const c = country.toLowerCase();
    const overridePath = path.join(__dirname, 'src', 'script', `overrides.${c}`);
    if (fs.existsSync(overridePath)) {
        try {
            return fs.readFileSync(overridePath, 'utf8');
        } catch (err) {
            console.warn(`[gulp] Falha ao ler override JS ${overridePath}:`, err.message);
        }
    }
    return '';
}

function jsProductionFor(country) {
    const dest = productionDestFor(country);
    const srcGlobs = ['dist/js/**/*.js'];
    const overrideContent = getJsOverrideFor(country);

    return gulp.src(srcGlobs, { allowEmpty: true })
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(gulpTerser({
            compress: {
                directives: false,
                drop_console: true,
                drop_debugger: true
            }
        }).on('error', function(err) {
            console.error('[gulp] gulp-terser error:', err);
            this.emit('end');
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(through.obj((file, enc, cb) => {
            const jsContent = file.contents.toString(enc);

            // estrutura js final com arquivo overrides
            const final = `${overrideContent}
                <script>
                    ${jsContent}
                </script>`;

            file.contents = Buffer.from(final, enc);
            file.path = path.join(dest, 'main.js');
            cb(null, file);
        }))
        .pipe(replace(/[\r\n]+/g, ''))
        .pipe(replace(/\s{2,}/g, ' '))
        .pipe(gulp.dest(dest));
}

// ------------------------ fim JS Production ------------------------

gulp.task('clean-production', () =>
    del([path.join(paths.production.dest, '**'), `!${paths.production.dest}`])
);

function makeProductionTask(country) {
    return gulp.series(
        function cleanWrap() { return cleanProductionFor(country); },
        function htmlWrap() { return htmlProductionFor(country); },
        function cssWrap() { return cssProductionFor(country); },
        function compactWrap() { return compactCssFor(country); },
        function jsWrap() { return jsProductionFor(country); }
    );
}

gulp.task('build-production:both', gulp.series(
    makeProductionTask('br'),
    makeProductionTask('co')
));

// Task principal de produção:
// - Garante build primeiro (gera dist/)
// - Se COUNTRY setada (br|co), gera só esse país; senão, gera ambos
gulp.task('build-production', (done) => {
    const country = process.env.COUNTRY && process.env.COUNTRY.toLowerCase();
    if (country && (country === 'br' || country === 'co')) {
        return gulp.series('build', makeProductionTask(country))(done);
    } else {
        return gulp.series('build', 'build-production:both')(done);
    }
});

// ------------------------ Dev server/watch ------------------------

gulp.task('serve', () => {
    browserSync.init({ server: { baseDir: './dist' } });

    gulp.watch('src/**/*.pug', gulp.series('pug'));
    gulp.watch(paths.sass.watch, gulp.series('sass')); // não adicionamos watch para overrides .css
    gulp.watch([
        ...scriptPaths.main,
        ...scriptPaths.templates,
        ...scriptPaths.components
    ], gulp.series('js'));
    gulp.watch(paths.externalJs.src, gulp.series('externalJs'));
    gulp.watch('./src/script/imports.js', gulp.series('js'));
});

gulp.task('watch', gulp.series('serve'));