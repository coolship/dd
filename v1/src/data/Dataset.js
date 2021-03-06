//rendering tools
import _ from 'lodash';
import kdbush from 'kdbush';



const makePointsFromUmis = (umis) => {
	return _.map(umis, (u) => u.asPoint());
};

const default_types = {
	"-1": {
		"color": [255, 255, 255, .25],
		"size": 1, //ACTB
		name: "ACTB",

	},
	"0": {
		"color": [255, 255, 255, 1],
		"size": 1, //GAPDH --opaque white
		"name": "GAPDH",
	},
	"1": {
		"color": [0, 255, 0, .7],
		"size": 1, // GFP
		"name": "GFP",
	},
	"2": {
		"color": [255, 0, 0, .7],
		"size": 1, // RFP
		"name": "RFP"
	}
};


const makeUmis = (json, sequences = null) => {
	var l = json.length;
	var umis = _.map(json,
		function (e, i) {
			var t = default_types[Math.floor(e[0])];
			var color = t && t.color ? t.color : [255, 255, 255, 1];
			var size = t && t.size ? t.size : 1;
			var z = (1 - i / l);
			var seq = sequences ? sequences[i] : null;

			const u = {
				x: e[1],
				y: e[2],
				type: e[0],
				idx: i,
				seq: seq,
			};

			var appearance = {
				z: z,
				color: color,
				size: size,
			};

			return new Umi(u.x, u.y, u.id, u.type, u.idx, u.seq, appearance);
		}
	);
	return umis;
};



export class Umi {
	constructor(x, y, id, type, idx, seq, appearance = {}) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.type = type;
		this.idx = idx;
		this.seq = seq;
		this.appearance = appearance;
	}

	asPoint() {
		const { x, y, id, type, idx, seq } = this;
		const { z, color, size } = this.appearance;
		return { x, y, id, type, idx, seq, z, color, size };
	}
	typeName() {
		return default_types[this.type].name;
	}
}



export class Dataset {
	constructor(name, coordinate_data, annotations_url, umi_ids_url, metadata) {

		this.annotation_promise = null;
		this.coordinate_data = coordinate_data;
		this.name = name;
		this.annotations = null;
		this.sequences = null;
		this.slice = null;
		this.slice_names = ["", "", ""]

		window.current_dataset = this

		this.slices = [null, null, null]
		this.metadata = metadata

		this.annotations_url = annotations_url;

		//right now, this is only riggered when a url is provided.
		//probably not the best approach.
		//should be handled in init
		if (this.annotations_url) {
			this.fetchAnnotations();
		}



		// each key in fetch_funcs will correspond to a key in the metadata object
		var fetch_funcs = {
			"umi_ids_url": this.fetchUmiIds.bind(this),
			"winning_segments_grid_url": this.fetchWinningSegmentsGrid.bind(this),
			"segment_metadata_url": this.fetchSegmentMetadata.bind(this),

			//"segment_metadata_url":this.fetchSegmentMetadata.bind(this),
			//"passing_segments_grid_url":this.fetchPassingSegmentsGrid,
		}

		this.fetch_promises = []
		for (var k in fetch_funcs) {
			this.fetch_promises.push(fetch_funcs[k](this.metadata[k]))
		}

		this.slice_changed_time = Date.now()
	}


	fetchUmiIds(url) {
		window.fetch_url = url
		console.log(url)
		//returns a promise
		return fetch(url).then((response) => {
			return response.json();
		}).then((myJson) => {
			this.umi_infos = myJson;
			this.umi_ids = this.umi_infos.id
			this.umi_segs = this.umi_infos.seg

			this.umi_uxs = this.umi_infos.umap_x
			this.umi_uys = this.umi_infos.umap_y
			this.umi_uzs = this.umi_infos.umap_z

			window.umi_response = myJson;

			_.each(this.umis, (e, i) => {
				e.db_seg = this.umi_segs[i];
				e.db_umi = this.umi_ids[i];
				e.umap_x = this.umi_uxs[i];
				e.umap_y = this.umi_uys[i];
				e.umap_z = this.umi_uzs[i];
			});

			this.createSegmentUmiLookup()

		});
	}


	createSegmentUmiLookup() {
		this.segment_umi_idxs_lookup = {}
		for (var i = 0; i < this.umis.length; i++) {
			var e = this.umis[i]
			if (!(e.db_seg in this.segment_umi_idxs_lookup)) { this.segment_umi_idxs_lookup[e.db_seg] = [] }
			this.segment_umi_idxs_lookup[e.db_seg].push(i)
		}


	}

	umisInSegment(seg_id) {
		if (seg_id in this.segment_umi_idxs_lookup) {
			return this.segment_umi_idxs_lookup[seg_id].map(idx => this.umis[idx])
		} else {
			return []
		}
	}



	fetchWinningSegmentsGrid(url) {

		return fetch(url).then(function (response) {
			return (response.json())
		}).then(myJson => { this.winning_array = myJson }
		)
	}

	fetchSegmentMetadata(url) {

		return fetch(url).then(function (response) {
			return (response.json())
		}).then(myJson => {
			this.segment_metadata = myJson
			var coords = _.map(this.segment_metadata, (e, i) => [e.meanx, e.meany])
			this.seg_ids_array = _.map(this.segment_metadata, (e, i) => Number(i))
			this.segs_kd = kdbush(coords);
		}
		)
	}




	fetchPassingSegmentsGrid(url) {
		return fetch(url).then(function (response) {
			return (response.json())
		}).then(myJson => { this.passing_array = myJson })
	}



	getBestCell(x, y) {
		const x_discrete = Math.round(x * 100) / 100
		const y_discrete = Math.round(y * 100) / 100
		if (x_discrete in this.winning_array) {
			const cell = this.winning_array[x_discrete][y_discrete]
			return cell
		} else {
			return undefined
		}
	}

	getAllCells(x, y) {
		const x_discrete = Math.round(x * 100) / 100
		const y_discrete = Math.round(y * 100) / 100
		if (x_discrete in this.passing_array) {
			const list = this.passing_array[x_discrete][y_discrete]
			return list
		} else {
			return undefined
		}
	}

	sliceY() {
		const p = this.points;
		return Float32Array.from(this.slice.map((idx) => p[idx[0]].y))
	}
	sliceX() {
		const p = this.points;

		return Float32Array.from(this.slice.map((idx) => p[idx[0]].x))
	}
	sliceZ() {
		const p = this.points;
		return Float32Array.from(this.slice.map((idx) => p[idx[0]].z))
	}

	sliceR() {
		return Float32Array.from(this.slice.map((idx) => idx[1]))
	}
	sliceG() {
		return Float32Array.from(this.slice.map((idx) => 0))
	}
	sliceB() {
		return Float32Array.from(this.slice.map((idx) => 0))
	}
	sliceA() {
		return Float32Array.from(this.slice.map((idx) => .75))
	}
	getSliceTotalLength(idx) {
		idx = idx ? idx : 0;
		return this.slices[idx] ? this.slices[idx].length : 0;
	}
	getActiveSlice(idx) {
		idx = idx ? idx : 0;
		return this.slices[idx]
	}
	getSliceName(idx) {
		return this.slice_names[idx]
	}
	getLastSliceTime() {
		return this.slice_changed_time;
	}
	sliceNSlicer(start, end, idx) {

		idx = idx ? idx : 0;
		const slice = this.slices[idx]

		if (start || end) {

			return {
				R: this.sliceNR(idx).slice(start, end),
				G: this.sliceNG(idx).slice(start, end),
				B: this.sliceNB(idx).slice(start, end),
				A: this.sliceNA(idx).slice(start, end),
				X: this.sliceNX(idx).slice(start, end),
				Y: this.sliceNY(idx).slice(start, end),
				Z: this.sliceNZ(idx).slice(start, end),
			}
		}
		else {
			return {
				R: this.sliceNR(idx),
				G: this.sliceNG(idx),
				B: this.sliceNB(idx),
				A: this.sliceNA(idx),
				X: this.sliceNX(idx),
				Y: this.sliceNY(idx),
				Z: this.sliceNZ(idx),
			}
		}
	}

	sliceNY(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]
		if (!this.hasSlice(idx)) { return }
		const p = this.points;
		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => p[idx[0]].y))
		} else {
			return Float32Array.from(slice.map((idx) => p[idx].y))
		}
	}

	sliceNX(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]
		if (!this.hasSlice(idx)) { return }
		const p = this.points;
		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => p[idx[0]].x))
		} else {
			return Float32Array.from(slice.map((idx) => p[idx].x))
		}
	}

	sliceNZ(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]
		if (!this.hasSlice(idx)) { return }

		const p = this.points;
		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => p[idx[0]].z))
		} else {
			return Float32Array.from(slice.map((idx) => p[idx].z))
		}
	}




	sliceNR(idx) {
		idx = idx ? idx : 0;
		const slice = this.slices[idx]
		if (!this.hasSlice(idx)) { return }
		const color_val = idx == 2 ? 255 : 0

		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => idx[1] * color_val))
		} else {
			return Float32Array.from(slice.map((idx) => color_val))
		}
	}
	sliceNG(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]

		if (!this.hasSlice(idx)) { return }

		const color_val = idx == 1 ? 255 : 0

		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => idx[1] * color_val))
		} else {
			return Float32Array.from(slice.map((idx) => color_val))
		}

	}
	sliceNB(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]

		if (!this.hasSlice(idx)) {
			return
		}
		const p = this.points;

		const color_val = idx == 0 ? 255 : 0

		if (slice[0].constructor === Array) {
			return Float32Array.from(slice.map((idx) => idx[1] * color_val))

		} else {
			return Float32Array.from(slice.map((idx) => color_val))
		}

	}
	sliceNA(idx) {
		idx = idx ? idx : 0;

		const slice = this.slices[idx]
		if (!this.hasSlice(idx)) { return }
		return Float32Array.from(slice.map((idx) => .8))
	}


	setSliceXYRect({ x0, y0, x1, y1, idx }) {
		idx = idx ? idx : 0;

		this.slices[idx] = _.compact(_.map(this.umis, (u, i) => {
			return (u.x > x0 && u.x < x1) && (u.y > y0 && u.y < y1) ? i : null
		}))
		this.slice_changed_time = Date.now()

	}

	setUmiSlice(umis, idx, nm) {

		idx == idx ? idx : 0;


		this.slice_names[idx] = nm;

		if (!umis || umis.length == 0) {
			this.unsetUmiSlice(idx);
			return;
		} else {

			this.slices[idx] = umis;
		}

		this.slice_changed_time = Date.now();

	}
	unsetUmiSlice(idx) {
		idx == idx ? idx : 0
		this.slices[idx] = null;
		this.slice_changed_time = Date.now()
	}

	hasSlice(idx) {
		idx = idx ? idx : 0;
		const output = (this.slices[idx] != null) && (this.slices[idx].length > 0)

		return (output)
	}

	async initializeFromBuffers(statusCallback, completionCallback, metadata) {
		let that = this;
		let promises = [];
		for (let nm of ["r", "g", "b", "a", "r_seg", "g_seg", "b_seg", "a_seg", "x", "y", "z"]) {
			promises.push(
				fetch(metadata[nm.toUpperCase() + "BUFFER_url"]).then(function (response) {
					return response.arrayBuffer()
				}).then(function (buffer) {
					that[nm] = buffer;
				})
			)
		}

		function resolveAfter0Seconds() {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve('resolved');
				}, 0);
			});
		}

		function breakFromThread(callback) {
			return resolveAfter0Seconds().then(function () {
				return callback();
			});
		}

		statusCallback(0, "initializing umi data");
		this.umis = await breakFromThread(() => makeUmis(this.coordinate_data, this.sequences));
		statusCallback(20, "initializing point geometry");
		this.points = await breakFromThread(() => makePointsFromUmis(this.umis));
		statusCallback(40, "initializing coordinates");
		var coord_data = this.umis.map(function (e, i) {
			return [e.x, e.y];
		});
		statusCallback(50, "sorting with kdbush");
		this.kd = await breakFromThread(function () {
			return kdbush(coord_data)
		});

		statusCallback(50, "waiting for coord and color data");
		Promise.all(promises).then(completionCallback)

	}

	async initializeAsyncWithBuffers(statusCallback, completionCallback, metadata) {

		function resolveAfter0Seconds() {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve('resolved');
				}, 0);
			});
		}

		function breakFromThread(callback) {
			return resolveAfter0Seconds().then(function () {
				return callback();
			});
		}

		let that = this;
		let promises = [];
		for (let nm of ["r", "g", "b", "a", "r_seg", "g_seg", "b_seg", "a_seg", "x", "y", "z"]) {
			promises.push(
				fetch(metadata[nm.toUpperCase() + "BUFFER_url"]).then(function (response) {
					return response.arrayBuffer()
				}).then(function (buffer) {
					that[nm] = new Float32Array(buffer);
				})
			)
		}

		statusCallback(0, "initializing umi data");
		this.umis = await breakFromThread(() => makeUmis(this.coordinate_data, this.sequences));
		statusCallback(20, "initializing point geometry");
		this.points = await breakFromThread(() => makePointsFromUmis(this.umis));
		statusCallback(40, "initializing coordinates");
		var coord_data = this.umis.map(function (e, i) {
			return [e.x, e.y];
		});

		statusCallback(50, "sorting with kdbush");
		this.kd = await breakFromThread(function () {
			return kdbush(coord_data)
		});


		//statusCallback(60, "buffering color data");
		//await breakFromThread(this.makeColorBuffers.bind(this));

		statusCallback(60, "loading buffers");
		await Promise.all(promises)


		statusCallback(70, "fetching segmentation annotation");
		await this.annotation_promise;

		//await breakFromThread(this.makeColorBuffersFromCells.bind(this));

		//statusCallback(90, "buffering coordinate data")
		//await breakFromThread(this.makeCoordBuffers.bind(this));

		statusCallback(100, "initialized dataset");
		completionCallback();

	}


	async initializeAsync(statusCallback, completionCallback, config) {

		function resolveAfter0Seconds() {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve('resolved');
				}, 0);
			});
		}

		function breakFromThread(callback) {
			return resolveAfter0Seconds().then(function () {
				return callback();
			});
		}

		statusCallback(0, "initializing umi data");
		this.umis = await breakFromThread(() => makeUmis(this.coordinate_data, this.sequences));
		statusCallback(20, "initializing point geometry");
		this.points = await breakFromThread(() => makePointsFromUmis(this.umis));
		statusCallback(40, "initializing coordinates");
		var coord_data = this.umis.map(function (e, i) {
			return [e.x, e.y];
		});

		statusCallback(50, "sorting with kdbush");
		this.kd = await breakFromThread(function () {
			return kdbush(coord_data)
		});


		statusCallback(60, "buffering color data");
		await breakFromThread(this.makeColorBuffers.bind(this));

		statusCallback(70, "fetching segmentation annotation");
		await this.annotation_promise;


		await breakFromThread(this.makeColorBuffersFromCells.bind(this));

		statusCallback(90, "buffering coordinate data")
		await breakFromThread(this.makeCoordBuffers.bind(this));

		statusCallback(95, "fetching segmentation annotations")
		await Promise.all(this.fetch_promises)

		statusCallback(100, "initialized dataset");
		completionCallback();

	}

	initializeSync() {
		this.umis = makeUmis(this.coordinate_data, this.sequences);
		this.points = makePointsFromUmis(this.umis);
		var coord_data = this.umis.map(function (e, i) {
			return [e.x, e.y];
		});
		this.kd = kdbush(coord_data);
		this.makeColorBuffers();
		this.makeCoordBuffers();
	}


	getSubsetDataset(x0, y0, x1, y1) {
		/*returns a Dataset from a range of this current dataset*/
		var idxs = this.kd.range(x0, y0, x1, y1);
		var coords = idxs.map((e) => this.coordinate_data[e]);
		const ds = new Dataset(this.name + "_subs" + [x0, y0, x1, y1].join("_"), coords, null);
		ds.initializeSync();
		return ds;
	}

	getUmisInRange(x0, y0, x1, y1) {
		/*returns a Dataset from a range of this current dataset*/
		var idxs = this.kd.range(x0, y0, x1, y1);
		return idxs.map(e => this.umis[e])
	}

	getSegmentsInRange(x0, y0, x1, y1) {
		var idxs = this.segs_kd.range(x0, y0, x1, y1);
		return idxs.map(e => Object.assign(this.segment_metadata[this.seg_ids_array[e]], { id: this.seg_ids_array[e] }))
	}


	getR({
		by_segment
	}) {
		return by_segment ? this.r_seg : this.r;
	}
	getG({
		by_segment
	}) {
		return by_segment ? this.g_seg : this.g;
	}
	getB({
		by_segment
	}) {
		return by_segment ? this.b_seg : this.b;
	}
	getA({
		by_segment
	}) {
		return by_segment ? this.a_seg : this.a;
	}

	getX() {
		return this.x;
	}
	getY() {
		return this.y;
	}
	getZ() {
		return this.z;
	}

	makeColorBuffers() {
		this.r = Float32Array.from(this.points.map((p) => p.color[0]));
		this.g = Float32Array.from(this.points.map((p) => p.color[1]));
		this.b = Float32Array.from(this.points.map((p) => p.color[2]));
		this.a = Float32Array.from(this.points.map((p) => p.color[3]));
	}

	makeColorBuffersFromCells() {

		if (!this.segments) {
			throw "no cell segments defined";
		}
		const max_segment = this.segments.reduce((next, curr) => {
			return Math.max(next, curr)
		});

		var seed = 1;

		function seeded_random() {
			var x = Math.sin(seed++) * 10000;
			return x - Math.floor(x);
		}

		const colors = _.map(_.range(max_segment + 1), (i) => [(seeded_random()),
		(seeded_random()),
		(seeded_random())
		]);
		this.r_seg = Float32Array.from(this.segments.map((p) => colors[p][0]));
		this.g_seg = Float32Array.from(this.segments.map((p) => colors[p][1]));
		this.b_seg = Float32Array.from(this.segments.map((p) => colors[p][2]));
		this.a_seg = Float32Array.from(this.segments.map((p) => .5));
	}

	makeCoordBuffers() {

		this.x = Float32Array.from(this.points.map((p) => p.x));
		this.y = Float32Array.from(this.points.map((p) => p.y));
		this.z = Float32Array.from(this.points.map((p) => p.z));
	}

	fetchAnnotations() {

		var that = this;
		this.annotation_promise = fetch(this.annotations_url).then(function (response) {
			return response.json();
		}).then(function (myJson) {
			that.annotations = myJson;
			var seq_col = that.annotations.feature_cols.indexOf("seq");
			that.sequences = that.annotations["features"].map((e) => e[seq_col]);
			_.each(that.umis, function (e, i) {
				e.seq = that.sequences[i];
			});

			var seg_col = that.annotations.feature_cols.indexOf("seg");
			that.segments = that.annotations["features"].map((e) => e[seg_col]);

			_.each(that.umis, function (e, i) {
				e.seg = that.segments[i];
			});

			that.points = makePointsFromUmis(that.umis);
		});
	}






	idxs_by_segment(segment) {
		if (!this.segments_dict) {
			this.segments_dict = {};
			_.each(this.segments, (e, i) => {
				if (!this.segments_dict[e]) {
					this.segments_dict[e] = [];
				}
				this.segments_dict[e].push(i);
			});
		}
		return this.segments_dict[segment];
	}

	within(x, y, radius) {
		return this.kd.within(x, y, radius).map(idx => this.umis[idx]);
	}

	idxs_within(x, y, radius) {
		return this.kd.within(x, y, radius);
	}

	range(x0, y0, x1, y1) {
		return this.kd.range(x0, y0, x1, y1).map(idx => this.umis[idx]);
	}

	nearest(x, y, radius) {
		var umis = this.within(x, y, radius);
		if (umis.length < 1) {
			return null;
		}
		return umis.reduce(function (current, next_umi) {
			var d = (next_umi.x - x) ** 2 + (next_umi.y - y) ** 2;
			if (!current || d < current.d) {
				return {
					d: d,
					u: next_umi
				};
			} else {
				return current;
			}
		}, {
			u: undefined,
			d: Infinity
		})["u"];
	}


}
