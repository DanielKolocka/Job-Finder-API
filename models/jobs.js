const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a Job Title.'],
        trim: true,
        maxLength: [100, 'Job Title can not exceed 100 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter a Job Description'],
        maxLength: [1200, 'Job Description can not exceed 1200 characters.']
    },
    email: {
        type: String,
        required: false,
        validate: [validator.isEmail, 'Please enter a valid email adress']
    },
    address: {
        type: String,
        required: [true, 'Please add jobs address.']
    },
    company: {
        type: String,
        required: [true, 'Please add Company name.']
    },
    industry: {
        //can select multiple options, hence array of strings
        type: [String],
        required: true,
        // Allow users to select the industry
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Management',
                'Others'
            ],
            message: 'Please select the option(s) for industry.'
        }
    },
    jobType: {
        //Only select 1 option
        type: String,
        required: true,
        enum: {
            values: [
                'Permanent',
                'Temporary/Contract',
                'Internship'
            ],
            message: 'Please select the job type.'
        }
    },
    minEducation: {
        type: String,
        required: true,
        enum: {
            values: [
                'Bachelors',
                'Masters',
                'Phd',
                'None'
            ],
            message: 'Please select minimum education requirement.'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: true,
        enum: {
            values: [
                'No Experience',
                '1 Year - 2 Years',
                '2 Year - 5 Years',
                '5+ Years',
            ],
            message: 'Please select required experience'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please enter expected salary for this position.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        //Default date is 1 week from posting
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object],
        //user can't see this
        select: false
    }

});

//Creating job slug before saving
jobSchema.pre('save', function (next) {
    //Creating slug before saving to DB
    this.slug = slugify(this.title, { lower: true });
    next();

});

module.exports = mongoose.model('Job', jobSchema);