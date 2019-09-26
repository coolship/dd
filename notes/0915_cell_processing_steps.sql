-- UPDATE umi 
-- SET xumi_xy=ST_SetSRID(ST_MakePoint(x, y),ST_SRID(segment.kde_density)) 
-- FROM segment
-- WHERE segment.id = umi.seg
-- AND umi.dsid=:name;

-- UPDATE umi
-- SET kde_val= ST_NearestValue(kde_density, ST_SetSRID(umi.xumi_xy,4326 ))
-- FROM segment 
-- WHERE segment.id = umi.seg
-- AND umi.dsid=:name;

-- UPDATE segment SET hull1 = ch.hull
-- FROM(
-- SELECT umi.seg as seg, ST_ConvexHull(ST_Collect(xumi_xy))  as hull
-- FROM umi JOIN segment ON segment.id= umi.seg
-- WHERE segment.kde_density is not null 
-- AND umi.kde_val >= 1
-- AND segment.dsid=:name
-- GROUP BY umi.seg 
-- ) as ch
-- WHERE ch.seg = segment.id
-- AND umi.dsid=:name;

-- UPDATE segment SET hull128 = ch.hull
-- FROM(
-- SELECT umi.seg as seg, ST_ConvexHull(ST_Collect(xumi_xy))  as hull
-- FROM umi JOIN segment ON segment.id= umi.seg
-- WHERE segment.kde_density is not null 
-- AND umi.kde_val >= 128
-- AND segment.dsid=:name
-- GROUP BY umi.seg 
-- ) as ch
-- WHERE ch.seg = segment.id
-- AND segment.dsid=:name;

-- UPDATE segment SET hull12 = ch.hull
-- FROM(
-- SELECT umi.seg as seg, ST_ConvexHull(ST_Collect(xumi_xy))  as hull
-- FROM umi JOIN segment ON segment.id= umi.seg
-- WHERE segment.kde_density is not null 
-- AND umi.kde_val >= 12
-- AND segment.dsid=:name
-- GROUP BY umi.seg 
-- ) as ch
-- WHERE ch.seg = segment.id
-- AND segment.dsid=:name;

-- UPDATE segment SET center = ch.centroid
-- FROM(
-- SELECT umi.seg as seg, ST_Centroid(ST_Collect(xumi_xy))  as centroid
-- FROM umi JOIN segment ON segment.id= umi.seg
-- WHERE segment.kde_density is not null 
-- AND segment.dsid=:name
-- GROUP BY umi.seg 
-- ) as ch
-- WHERE ch.seg = segment.id
-- AND segment.dsid=:name;

-- UPDATE segment SET area12 = ST_Area(hull12);


-- SELECT ST_SummaryStats(ST_Union(resampled ))
-- FROM  (
--     SELECT 
--     id, 
--     ST_Resample(kde_density, ST_MakeEmptyRaster(2000,2000, -10, -10, .01, .01, 0, 0, 4326))  AS resampled 
    
-- FROM segment WHERE segment.kde_density IS NOT null
--     )  AS rs;

    



update segment set rval=(5915587277.0*id)%255/256;
update segment set gval=(5915587277.0*id)/256%255/256;
update segment set bval=(5915587277.0*id)/256/256%255/256;


UPDATE dataset SET raster_2k_red = ST_MapAlgebra(
    ST_AddBand(
        ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),
        1, '8BUI'::text, 5, 0), 
    images.union_img, '[rast1]*0+[rast2]', null, 'UNION')
FROM (
    SELECT rs.dsid as dsid, ST_Union(resampled, 'SUM' ) as union_img
        FROM  (
            SELECT  ST_MapAlgebra(
                ST_Resample(kde_density, ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),'Bilinear'),
                1,null,FORMAT('[rast] * %s ',segment.rval)
            )  AS resampled,
            dsid
        FROM segment WHERE segment.kde_density IS NOT null
            )  AS rs
        GROUP BY rs.dsid
) AS images
where images.dsid = dataset.id;



UPDATE dataset SET raster_2k_green = ST_MapAlgebra(
    ST_AddBand(
        ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),
        1, '8BUI'::text, 5, 0), 
    images.union_img, '[rast1]*0+[rast2]', null, 'UNION')
FROM (
    SELECT rs.dsid as dsid, ST_Union(resampled, 'SUM'  ) as union_img
        FROM  (
            SELECT  ST_MapAlgebra(
ST_Resample(kde_density, ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),'Bilinear'),
                1,null,FORMAT('[rast] * %s ',segment.gval)
            )  AS resampled,
            dsid
        FROM segment WHERE segment.kde_density IS NOT null
            )  AS rs
        GROUP BY rs.dsid
) AS images
where images.dsid = dataset.id;





UPDATE dataset SET raster_2k_blue = ST_MapAlgebra(
    ST_AddBand(
        ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),
        1, '8BUI'::text, 5, 0), 
    images.union_img, '[rast1]*0+[rast2]', null, 'UNION')
FROM (
    SELECT rs.dsid as dsid, ST_Union(resampled, 'SUM'  ) as union_img
        FROM  (
            SELECT  ST_MapAlgebra(
ST_Resample(kde_density, ST_MakeEmptyRaster(2000,2000, -20, -20, .02, .02, 0, 0, 4326),'Bilinear'),
                1,null,FORMAT('[rast] * %s ',segment.bval)
            )  AS resampled,
            dsid
        FROM segment WHERE segment.kde_density IS NOT null
            )  AS rs
        GROUP BY rs.dsid
) AS images
where images.dsid = dataset.id;





UPDATE dataset SET raster_2k_all = 
       ST_AddBand( ST_AddBand( 
            raster_2k_red,raster_2k_green), raster_2k_blue);

