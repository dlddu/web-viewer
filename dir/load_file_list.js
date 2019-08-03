function get_contents( url ) {

	if( url.includes( '.' ) ) {

		const ext_index = url.lastIndexOf( '.' ) + 1
		const ext = url.slice( ext_index, url.length ).toLowerCase()
		const not_sup_ext = [ "mkv" ]

		if( ext == "mp4" ) {

			clear_list()
			append_movie( url, ext_index, ext )
			return
		}
		else if( not_sup_ext.includes( ext ) ) {

			alert( "this kinds of videos are not supported" )
			return
		}
	}
	load_ajax( url )
}

function load_ajax( url ) {

	var xhr = new XMLHttpRequest()
	xhr.open( "GET", url, true )
	xhr.onreadystatechange = function() {

		if( xhr.readyState == 4 ) {

			const xhr_accept = xhr.getResponseHeader( "Accept" )
			clear_list()
			
			if( xhr_accept == "directory" ) {

				append_dir( url, xhr.responseText )	
			}
			else if( xhr_accept == "text" ) {

				var file_div = document.getElementById( "file" )
				file_div.style = 'white-space: pre;'
				file_div.textContent = xhr.responseText
			}
			else
				alert( xhr_accept )
		}
	}
	xhr.send()
}

function clear_list() {

	var to_remove = document.getElementById( "list" )
	if( to_remove != null )
		to_remove.remove()
}

function append_movie( url, ext_index, ext ) {

	var video_div = document.createElement( "video" )
	video_div.width = "320"
	video_div.height = "240"
	video_div.controls = ' '
	video_div.autoplay = ' '

	var contents = document.createElement( "source" )
	contents.src = url
	contents.type = "video/" + ext

	var subtitle = document.createElement( "track" )
	var temp = document.getElementsByTagName( "li" )
	subtitle.label = "한국어"
	subtitle.kind = "subtitles"
	subtitle.src = url.slice( 0, ext_index ) + "vtt"

	document.getElementById( "file" ).appendChild( video_div )
	video_div.appendChild( contents )
	video_div.appendChild( subtitle )
}

function append_dir( url, data ) {

	var res_json = JSON.parse( data )
	var file_div = document.getElementById( "filelist" )
	var ul_ = document.createElement( "ul" )
	file_div.appendChild( ul_ )
	ul_.id = "list"
	for( var i = 0; i < res_json.length; i++ ) {
		
		var li_ = document.createElement( "li" )
		var node = ul_.appendChild( li_ )
		node.id = "node_" + i
		node.textContent = res_json[ i ]
		node.onclick = ( event ) => get_contents( url + '/' + event.target.textContent )
	}
}
