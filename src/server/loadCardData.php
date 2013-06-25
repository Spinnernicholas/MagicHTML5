<?php
include("simple_html_dom.php");

// Create DOM from URL or file
$html = file_get_html('http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' . $_GET['uid']);

$name = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_nameRow div.value', 0)->plaintext);

$manaRaw = $html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_manaRow div.value img');
$mana = array();
forEach($manaRaw as $i => $value)
{
	$mana[$i] = $value->alt;
}

$cmc = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow div.value', 0)->plaintext);
if($cmc == "")
{
	$mana = null;
	$cmc = null;
}

$typeRaw = $html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow div.value', 0)->plaintext;
$typeRaw = explode("—", $typeRaw);
$types = explode(" ", trim($typeRaw[0]));
$subtypes = explode(" ", trim($typeRaw[1]));

$text = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow div.value', 0)->plaintext);
$flavortext = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_flavorRow div.value', 0)->plaintext);

$pt = $html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ptRow div.value', 0)->plaintext;
$pt = explode("/", $pt);
$power = trim($pt[0]);
if($power !== "")
{
	$toughness = trim($pt[1]);
	if($toughness === "")
	{
		$loyalty = $power;
		$power = null;
		$toughness = null;
	}
}
else
{
	$power = null;
}
	
$set = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_setRow div.value', 0)->plaintext);

$rarity = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rarityRow div.value', 0)->plaintext);

$otherSetsRaw = $html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_otherSetsValue a img');
$otherSets = array();
forEach($otherSetsRaw as $i => $img)
{
	$otherSets[$i] = $img->alt;
}

$number = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_numberRow div.value', 0)->plaintext);

$artist = trim($html->find('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_artistRow div.value', 0)->plaintext);

echo "{
name: ". json_encode($name).",
cost: ". json_encode($mana).",
cmc: ". json_encode($cmc).",
types: ".json_encode($types).",
subtypes: ". json_encode($subtypes).",
text: ". json_encode($text).",
flavortext: ". json_encode($flavortext).",
power: ". json_encode($power).",
thoughness: ". json_encode($toughness).",
loyalty: ". json_encode($loyalty).",
set: ". json_encode($set).",
rarity: ". json_encode($rarity).",
otherSets: ". json_encode($otherSets).",
number: ". json_encode($number).",
artist: ". json_encode($artist)."
}";
?>
