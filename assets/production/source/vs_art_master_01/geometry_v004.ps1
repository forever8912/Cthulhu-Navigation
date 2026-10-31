param([string]$Candidate='')
Add-Type -AssemblyName System.Drawing
$source=Join-Path $PSScriptRoot 'gate_b'
$review=Join-Path $PSScriptRoot '../../review/vs_art_master_01'
$scale=720.0/941
$cells=0..5 | ForEach-Object {
 @{index=$_+1;x=550+140*$_;y=570;width=140;height=160;clear=@{x=556+140*$_;y=578;width=128;height=152};foot=@{x=620+140*$_;y=730};logical_clear_height=152*$scale}
}
$spec=@{task_id='VS-ART-GEOMETRY-01';status='REVIEW';canvas=@{width=1672;height=941};source_to_logical=$scale;logical_canvas=@{width=1280;height=720};coordinate_note='沿用已批准 Gate A 原图坐标。140×160 是源图格尺寸，逻辑格约107.12×122.42；不得误标成140×160逻辑像素。';baseline=730;pitch=140;crew_logical_height=112;crew_source_height=112/$scale;cells=$cells;layers=@{front='opaque hull and posts outside clear rectangles';back='six independently painted timber panels behind openings, on same 1672x941 canvas';hull='painted continuous shell behind cutaway; no baked furniture or characters'}}
$spec | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $source 'ship_lv1_geometry_v004.json')
if(!$Candidate){
 foreach($kind in @('guide','mask')){
  $bmp=[Drawing.Bitmap]::new(1672,941,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g=[Drawing.Graphics]::FromImage($bmp)
  $g.CompositingMode=[Drawing.Drawing2D.CompositingMode]::SourceCopy
  if($kind -eq 'guide'){
   $g.Clear([Drawing.Color]::FromArgb(255,25,34,42))
   $brush=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255,115,82,55))
   $pts=[Drawing.Point[]]@([Drawing.Point]::new(362,435),[Drawing.Point]::new(540,510),[Drawing.Point]::new(1230,510),[Drawing.Point]::new(1230,410),[Drawing.Point]::new(1534,410),[Drawing.Point]::new(1510,740),[Drawing.Point]::new(1390,795),[Drawing.Point]::new(550,795),[Drawing.Point]::new(440,730))
   $g.FillPolygon($brush,$pts);$brush.Dispose()
  }else{$g.Clear([Drawing.Color]::White)}
  foreach($c in $cells){
   $r=$c.clear
   $b=[Drawing.SolidBrush]::new($(if($kind -eq 'guide'){[Drawing.Color]::FromArgb(255,0,220,220)}else{[Drawing.Color]::Transparent}))
   $g.FillRectangle($b,$r.x,$r.y,$r.width,$r.height);$b.Dispose()
  }
  $g.Dispose();$bmp.Save((Join-Path $source "ship_lv1_geometry_${kind}_v004.png"),[Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()
 }
}
if($Candidate){
 $im=[Drawing.Bitmap]::new((Resolve-Path -LiteralPath $Candidate).Path)
 $checks=@();$sizePass=($im.Width -eq 1672 -and $im.Height -eq 941)
 if($sizePass){foreach($c in $cells){$r=$c.clear;$bad=0;$maxA=0
  for($y=$r.y;$y -lt $r.y+$r.height;$y++){for($x=$r.x;$x -lt $r.x+$r.width;$x++){ $a=$im.GetPixel($x,$y).A;if($a -gt 8){$bad++};if($a -gt $maxA){$maxA=$a} }}
  $checks+=@{cell=$c.index;opaque_pixels_in_clear_rect=$bad;max_alpha=$maxA;pass=($bad -eq 0)}
 }}
 $pass=$sizePass -and @($checks|Where-Object {!$_.pass}).Count -eq 0 -and $checks.Count -eq 6
 @{status=$(if($pass){'REVIEW'}else{'REWORK'});geometry_pass=$pass;expected_size=@(1672,941);actual_size=@($im.Width,$im.Height);size_pass=$sizePass;clear_rect_checks=$checks;alpha_threshold=8;note='不缩放、不拉伸、不修改生成结果。尺寸不符直接失败。几何通过仍需材质、边缘、遮挡与分层审核。'}|ConvertTo-Json -Depth 6|Set-Content -Encoding utf8 (Join-Path $review 'geometry_v004_check.json')
 $im.Dispose()
}
