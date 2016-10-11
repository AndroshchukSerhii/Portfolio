'use strict';    

module.exports = function() {
			$.gulp.task('convert',function() {	
				 return $.gulp.src('/source/style/**/*.scss')
				 	.pipe($.Cssunit({
            		type     :    'px-to-rem',
           		   rootSize :    16
       		   }))
        			.pipe($.gulp.dest('/source/style'))			 
	});
};