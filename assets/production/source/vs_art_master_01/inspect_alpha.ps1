param([Parameter(Mandatory=$true)][string]$ImagePath, [int]$SampleY=470, [int[]]$Centers=@(450,680,900,1120,1350,1580))
# 仅只读检查透明舱口，不改动图像。
Add-Type -AssemblyName System.Drawing
$im=[System.Drawing.Bitmap]::new((Resolve-Path -LiteralPath $ImagePath).Path)
try {
 $bays=@()
 foreach($cx in $Centers){
  if($im.GetPixel($cx,$SampleY).A -ge 8){$bays+=@{center=$cx;error='sample is opaque'};continue}
  $left=$cx;while($left -gt 0 -and $im.GetPixel($left-1,$SampleY).A -lt 8){$left--}
  $right=$cx;while($right -lt ($im.Width-1) -and $im.GetPixel($right+1,$SampleY).A -lt 8){$right++}
  $top=$SampleY;while($top -gt 0 -and $im.GetPixel($cx,$top-1).A -lt 8){$top--}
  $bottom=$SampleY;while($bottom -lt ($im.Height-1) -and $im.GetPixel($cx,$bottom+1).A -lt 8){$bottom++}
  $bays+=@{center=$cx;left=$left;right=$right;top=$top;bottom=$bottom;width=$right-$left+1;height=$bottom-$top+1;ratio=($right-$left+1)/($bottom-$top+1)}
 }
 @{width=$im.Width;height=$im.Height;corner_alpha=$im.GetPixel(0,0).A;alpha_threshold=8;sample_y=$SampleY;bays=$bays;note='中心横纵透明跨度，仅为几何诊断；不替代完整矩形净空与视觉验收'}|ConvertTo-Json -Depth 5
} finally {$im.Dispose()}
