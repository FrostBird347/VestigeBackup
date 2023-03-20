import matplotlib.pyplot as plt
import csv
import time
import datetime
import numpy as np
import seaborn
from colorhash import ColorHash
import matplotlib.cm as cm

def formatrgbvalue(v):
	return int(max(0, min(float(v) * 255, 255)))

def rgbtohex(r, g, b): 
	return "#{0:02x}{1:02x}{2:02x}".format(formatrgbvalue(r), formatrgbvalue(g), formatrgbvalue(b))

def getslug(r, g, b):
	rgb = [r, g, b]
	match rgb:
		case ["1","1","1"]:
			return "Survivor"
		case ["1","1","0.4509804"]:
			return "Monk"
		case ["1","0.4509804","0.4509804"]:
			return "Hunter"
		case ["0.94118","0.75686","0.59216"]:
			return "Gourmand"
		case ["0.43922","0.13725","0.23529"]:
			return "Artificer"
		case ["0.56863","0.8","0.94118"]:
			return "Rivulet"
		case ["0.31","0.18","0.41"]:
			return "Spearmaster"
		case ["0.66667","0.9451","0.33725"]:
			return "Saint"
		case ["0.09","0.14","0.31"]:
			return "Inv"
		case _:
			return "Custom Colour"

plt.style.use('dark_background')

frequencydata = {}
timestamps = []
currenttime = -1
currenttimestring = ""
lasttimestamp = datetime.datetime.strptime('26/02/2023',"%d/%m/%Y")
currenttimestamp = lasttimestamp

regioncounts = {}
roomcounts = {}

spawnx = []
spawny = []
targetx = []
targety = []
uniqspawnx = []
uniqspawny = []
uniqtargetx = []
uniqtargety = []

hourrates = []
currenthourrate = [0]
hourtimestamps = []
hourcurrenttime = -1
hourcurrenttimestring = ""
hourlasttimestamp = datetime.datetime.strptime('26/02/2023 05',"%d/%m/%Y %H")
hourcurrenttimestamp = hourlasttimestamp
secondslasttemptimestamp = datetime.datetime.strptime('26/02/2023 05:21:28',"%d/%m/%Y %H:%M:%S")

colourcounts = {
	"Custom Colour": []
}
colourkey = {
	"Survivor": rgbtohex("1","1","1"),
	"Monk": rgbtohex("1","1","0.4509804"),
	"Hunter": rgbtohex("1","0.4509804","0.4509804"),
	"Gourmand": rgbtohex("0.94118","0.75686","0.59216"),
	"Artificer": rgbtohex("0.43922","0.13725","0.23529"),
	"Rivulet": rgbtohex("0.56863","0.8","0.94118"),
	"Spearmaster": rgbtohex("0.31","0.18","0.41"),
	"Saint": rgbtohex("0.66667","0.9451","0.33725"),
	"Inv": rgbtohex("0.09","0.14","0.31"),
	"Custom Colour": "#0F0F0F"
}

with open('VestigeBackup.csv','r') as csvfile:
	lines = csv.reader(csvfile, delimiter=',')
	for row in lines:
		if row[2] != "region":
			
			if row[2] not in frequencydata:
				frequencydata[row[2]] = []
				regioncounts[row[2]] = 0
				for i in range(currenttime + 1):
					frequencydata[row[2]].append(0)
			
			if row[1] not in roomcounts:
				roomcounts[row[1]] = 0
			
			currentslug = getslug(row[3], row[4], row[5])
			
			if currentslug not in colourcounts:
				colourcounts[currentslug] = []
				for i in range(currenttime + 1):
					colourcounts[currentslug].append(0)
			
			if row[0][0:10] != currenttimestring:
				currenttimestring = row[0][0:10]
				for region in frequencydata:
					frequencydata[region].append(0)
				for slug in colourcounts:
					colourcounts[slug].append(0)
				lasttimestamp = currenttimestamp
				currenttimestamp = datetime.datetime.strptime(row[0][0:10], "%d/%m/%Y")
				temptimestamp = currenttime + int((currenttimestamp - lasttimestamp).total_seconds() / 86400)
				if temptimestamp == -1:
					temptimestamp = 0
				timestamps.append(temptimestamp)
				currenttime += 1
			
			if row[0][0:13] != hourcurrenttimestring:
				hourcurrenttimestring = row[0][0:13]
				hourrates.append(np.mean(currenthourrate))
				
				if np.mean(currenthourrate) < 15:
					print("----")
					print("Before " + row[0][0:13])
					print(np.mean(currenthourrate))
					print(currenthourrate)
					print("----")
				
				hourlasttimestamp = hourcurrenttimestamp
				hourcurrenttimestamp = datetime.datetime.strptime(row[0][0:13], "%d/%m/%Y %H")
				hourtemptimestamp = hourcurrenttime + int((hourcurrenttimestamp - hourlasttimestamp).total_seconds() / 3600)
				if hourtemptimestamp == -1:
					hourtemptimestamp = 0
				hourtimestamps.append(hourtemptimestamp)
				hourcurrenttime += 1
				currenthourrate = []
				secondslasttemptimestamp = datetime.datetime.strptime(row[0],"%d/%m/%Y %H:%M:%S")
			else:
				secondscurrenttemptimestamp = datetime.datetime.strptime(row[0],"%d/%m/%Y %H:%M:%S")
				currenthourrate.append(int((secondscurrenttemptimestamp - secondslasttemptimestamp).total_seconds()))
				secondslasttemptimestamp = secondscurrenttemptimestamp
			
			frequencydata[row[2]][currenttime] += 1
			regioncounts[row[2]] += 1
			roomcounts[row[1]] += 1
			colourcounts[currentslug][currenttime] += 1
			spawnx.append(int(row[6]))
			spawny.append(int(row[7]))
			targetx.append(int(row[8]))
			targety.append(int(row[9]))
			if row[6] != row[8] and row[7] != row[9]:
				uniqspawnx.append(int(row[6]))
				uniqspawny.append(int(row[7]))
				uniqtargetx.append(int(row[8]))
				uniqtargety.append(int(row[9]))


fig, ax = plt.subplots(layout='constrained')
plt.minorticks_on()

colourpalette = []
for region in frequencydata:
	colourpalette.append(ColorHash(region).hex)
colours = seaborn.color_palette(colourpalette, len(frequencydata.keys()))
ax.set_prop_cycle('color', colours)

ax.stackplot(timestamps, np.vstack(frequencydata.values()), labels=frequencydata.keys())

fig.legend(loc='outside lower center', fontsize='x-small', ncol=(len(frequencydata.keys()) / 1.5))
fig.set_figheight(10)
fig.set_figwidth(len(frequencydata.keys()) / 2.25)
#ax.set_xticks(timestamps)
ax.set_xlim(left=0, right=(timestamps[len(timestamps) - 8])) #Don't count the last week

ax.set_title('Region Frequency')
ax.set_xlabel('Days since 26/02/2023 (UCT)')
ax.set_ylabel('Vestiges')

plt.savefig('RegionFreq.svg', metadata={'Date': None})
#plt.show()
plt.close()





fig, ax = plt.subplots()
plt.minorticks_on()

colours = seaborn.color_palette(colourpalette, len(regioncounts.keys()))
ax.set_prop_cycle('color', colours)

ax.pie(regioncounts.values(), labeldistance=None, labels=regioncounts.keys(), radius=(len(regioncounts.keys()) / 24), center=((len(regioncounts.keys()) / 12) + 4, (len(regioncounts.keys()) / 12) + 1))

fig.legend(loc='outside upper left', fontsize='x-small')
fig.set_figheight(len(regioncounts.keys()) / 6)
fig.set_figwidth(1 + len(regioncounts.keys()) / 6)

ax.set_title('Region Frequency', y=1.08)

plt.savefig('RegionCount.svg', metadata={'Date': None})
#plt.show()
plt.close()





seaborn.jointplot(x=spawnx, y=spawny, height=10, kind='hist', xlim=(-50, 500), ylim=(-50, 400), cmap=cm.gnuplot2, marginal_ticks=True, cbar=True)
plt.suptitle('Death Positions')
plt.tight_layout()
plt.minorticks_on()

plt.savefig('SpawnPos.png', metadata={'Date': None})
#plt.show()
plt.close()





seaborn.jointplot(x=targetx, y=targety, height=10, kind='hist', xlim=(-50, 500), ylim=(-50, 400), cmap=cm.gnuplot2, marginal_ticks=True, cbar=True)
plt.suptitle('Hover Positions')
plt.tight_layout()
plt.minorticks_on()

plt.savefig('TargetPos.png', metadata={'Date': None})
#plt.show()
plt.close()





seaborn.jointplot(x=uniqspawnx, y=uniqspawny, height=10, kind='hist', xlim=(-50, 500), ylim=(-50, 400), cmap=cm.gnuplot2, marginal_ticks=True, cbar=True)
plt.suptitle('Death Positions (values with a duplicate hover pos were removed)')
plt.tight_layout()
plt.minorticks_on()

plt.savefig('UniqSpawnPos.png', metadata={'Date': None})
#plt.show()
plt.close()





seaborn.jointplot(x=uniqtargetx, y=uniqtargety, height=10, kind='hist', xlim=(-50, 500), ylim=(-50, 400), cmap=cm.gnuplot2, marginal_ticks=True, cbar=True)
plt.suptitle('Hover Positions (values with a duplicate spawn pos were removed)')
plt.tight_layout()
plt.minorticks_on()

plt.savefig('UniqTargetPos.png', metadata={'Date': None})
#plt.show()
plt.close()





fig, ax = plt.subplots()
plt.minorticks_on()

colourpalette = []
for slugcat in colourcounts:
	colourpalette.append(colourkey[slugcat])
colours = seaborn.color_palette(colourpalette, len(colourcounts.keys()))
ax.set_prop_cycle('color', colours)

ax.stackplot(timestamps, np.vstack(colourcounts.values()), labels=colourcounts.keys())

fig.legend(loc='outside lower center', fontsize='medium', ncol=len(colourcounts.keys()))
fig.set_figheight(10)
fig.set_figwidth(20)
#ax.set_xticks(timestamps)
ax.set_xlim(left=0, right=(timestamps[len(timestamps) - 8])) #Don't count the last week

ax.set_title('Slugcat Frequency')
ax.set_xlabel('Days since 26/02/2023 (UCT)')
ax.set_ylabel('Vestiges')

plt.savefig('SlugcatFreq.svg', metadata={'Date': None})
#plt.show()
plt.close()





fig, ax = plt.subplots()
plt.minorticks_on()

ax.plot(hourtimestamps, hourrates)

fig.set_figheight(10)
fig.set_figwidth(20)
ax.set_xlim(left=0, right=(hourtimestamps[len(hourtimestamps) - 168])) #Don't count the last week

ax.set_title('Average upload rate')
ax.set_xlabel('Hours since 26/02/2023 05:00:00 (UCT)')
ax.set_ylabel('Seconds between an upload')

plt.savefig('HourFreq.svg', metadata={'Date': None})
#plt.show()
plt.close()