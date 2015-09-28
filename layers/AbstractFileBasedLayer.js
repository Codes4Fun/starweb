/**
 * Implementation of the {@link Layer} interface which reads its data from
 * a file during the {@link Layer#initialize} method.
 *
 * @author Brent Bryan
 * @author John Taylor
 */

function AbstractFileBasedLayer (assetManager, resources, fileName)
{
	var TAG = "AbstractFileBasedLayer";

	AbstractSourceLayer.call(this, resources, false);

	var fileSources = [];

	this.superInitialize = this.initialize;
	this.initialize = function () 
	{
		try
		{
			req = new XMLHttpRequest();
			req.open('GET', 'assets/' + fileName, true);
			req.responseType = 'arraybuffer';
			req.onload = (function (req, reader) {
				return function ()
				{
					reader.readSourceFile(req.response);
					reader.superInitialize();
				};
			})(req, this);
			req.send();
		}
		catch (e)
		{
			console.log(e);
		}
	};

	this.initializeAstroSources = function (sources) 
	{
		fileSources.forEach(function (source)
		{
			sources.push(source);
		});
	};

	this.readSourceFile = function (arraybuffer) 
	{
		var data = new DataView(arraybuffer);
		data.offset = 0;
		var proto = decodeMessage(definitions, 'AstronomicalSourcesProto', data, data.byteLength);
		proto.source.forEach(function (proto)
		{
			fileSources.push(new ProtobufAstronomicalSource(proto, this.getResources()));
		}, this);
		this.refreshSources({Reset:true});

		/*StopWatch watch = new StopWatchImpl().start();

		Log.d(TAG, "Loading Proto File: " + sourceFilename + "...");
		InputStream in = null;
		try 
		{
			in = assetManager.open(sourceFilename, AssetManager.ACCESS_BUFFER);
			AstronomicalSourcesProto.Builder builder = AstronomicalSourcesProto.newBuilder();
			builder.mergeFrom(in);

			for (AstronomicalSourceProto proto : builder.build().getSourceList()) 
			{
				fileSources.add(new ProtobufAstronomicalSource(proto, getResources()));
			}
			Log.d(TAG, "Found: " + fileSources.size() + " sources");
			String s = String.format("Finished Loading: %s > %s | Found %s sourcs.\n",
				sourceFilename, watch.end(), fileSources.size());
			Blog.d(this, s);

			refreshSources(EnumSet.of(UpdateType.Reset));
		} catch (IOException e) 
		{
			Log.e(TAG, "Unable to open " + sourceFilename);
		} finally 
		{
			Closeables.closeSilently(in);
		}*/
	}
}
