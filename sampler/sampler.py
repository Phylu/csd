#!/usr/bin/python
from numpy import random
import csv
import time

maxIncidentsPerMonth = 300
maxAdvisoriesPerMonth = 50
types = ['Phishing', 'Information leakage', 'Injection attacks', 'Malicious code',
             'Ransomware/Cryptoware', 'Denial of service', 'Botnets', 'Cyber espionage',
             'Data breaches', 'Hacking/Cracking', 'Spam', 'Illegal content', 'Other']
sectors = ['Public', 'Private', 'International']
incidentFields = ['id', 'date', 'CustomField.{Hulpmiddel}', 'CustomField.{Sector}']
advisoriesFields = ['datetime', 'id', 'version', 'description', 'likelihood', 'impact']


def get_date(i, separator='.'):
    currYear = int(time.strftime("%Y"))
    currMonth = int(time.strftime("%m"))
    monthDifference = 23 - i
    yearDifference = monthDifference // 12
    monthDifference = monthDifference % 12

    month = currMonth - monthDifference
    if month <= 0:
        month += 12
        yearDifference += 1
    year = currYear - yearDifference

    date = "01" + separator + str(month) + separator + str(year)
    return date


def sample_incidents():
    with open('incidents.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(incidentFields)

        for i in range(0, 24):
            for j in range(0, random.randint(0, maxIncidentsPerMonth)):
                writer.writerow(['someId',
                                 get_date(i),
                                 types[random.randint(0, len(types))],
                                 sectors[random.randint(0, len(sectors))]])


def sample_advisories():
    with open('advisories.csv', 'w') as f:
        writer = csv.writer(f, delimiter=';')
        writer.writerow(advisoriesFields)

        for i in range(0, 24):
            for j in range(0, random.randint(0, maxAdvisoriesPerMonth)):
                writer.writerow([get_date(i, "-") + " 00:00",
                                'id',
                                'version',
                                'description',
                                'H',
                                'H'])


def sample():
    sample_incidents()
    sample_advisories()


if __name__ == '__main__':
    sample()
