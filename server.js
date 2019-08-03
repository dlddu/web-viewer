var port = 10007
const http = require( "http" )
const fs = require( "fs" )
const domain = require( "domain" )

function app() {
	
	http.createServer(
	
		function ( req, res ) {

			var uri = decodeURI( req.url )
			var stats = fs.statSync( uri )

			if( uri == '/' ) {

				res.writeHead( 200, { "Accept": "directory" } )
				res.end( fs.readFileSync( __dirname + '/dir/index.html' ) )
			}
			else if( uri.indexOf( "/test_dir" ) != 0 && uri.indexOf( "/work/dir" ) != 0 ) {

				res.writeHead( 404 )
				res.end()
			}
			else if( stats.isDirectory() ) {

				fs.readdir(

					uri,

					function( err, filelist ) {

						res.writeHead( 200, { "Accept": "directory" } )
						res.end( JSON.stringify( filelist ) )
					}
				)
			}
			else if( stats.isFile() ) {

				if( uri.includes( '.' ) ) {

					var ext_index = uri.lastIndexOf( '.' ) + 1
					var ext = uri.slice( ext_index, uri.length ).toLowerCase()

					if( ext == "mp4" ) {

						var total = stats.size
						var range = req.headers.range

						if( !range ) {

							res.writeHead(
								
								200,
								
								{
									"Content-Length": total,
									"Content-Type": "video/mp4" 
								}
							)
							fs.createReadStream( uri ).pipe( res )
						}
						else {

							var positions = range.replace( /bytes=/, "" ).split( "-" )
							var start = parseInt( positions[ 0 ], 10 )
							var end = positions[ 1 ] ? parseInt( positions[ 1 ], 10 ) : total - 1
							var chunksize = ( end - start ) + 1
							
							res.writeHead(
								
								206,
								
								{
									"Content-Range": "bytes " + start + '-' + end + '/' + total,
									"Accept-Ranges": "bytes",
									"Content-Length": chunksize,
									"Content-Type": "video/mp4",
									"Accept": "video"
								}
							)
							fs.createReadStream( uri, { start: start, end: end } ).pipe( res )
						}
						return
					}
				}

				fs.readFile(

					uri,
					
					( err, data ) => {

						res.writeHead( 200, { "Accept": "text" } )
						res.end( data )
					}
				)
			}
		}
	).listen( 80 )
}

const app_domain = domain.create()
app_domain.on( "error", ( err ) => console.log( err ) )
app_domain.run( app )

console.log( 'Server running at port %d/', port )
