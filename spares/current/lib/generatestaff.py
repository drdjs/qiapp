import json

with open('staffnames2.js','w') as outfile:
	outfile.write('export default [\n')
	people=[]
	for cat in ['junior','intermediate','higher','consultant']:
		with open(cat+'.txt') as infile:
			for l in infile:
				outfile.write(repr({'id':l.replace(' ','').lower().strip(' \n'),'grade':cat,'label':l.strip(' \n')}))
				outfile.write('\n')
	outfile.write(']')
  
	    