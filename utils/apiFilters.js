class APIFilters {
    constructor(query, queryStr) {
        this.query = query,
            this.queryStr = queryStr
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };

        //Removing fields from the query. Eg. Sort isn't a query, while salary is.
        const removeFields = ['sort', 'fields', 'q'];
        removeFields.forEach(el => delete queryStrCopy[el]);
        //Advance filter using: lt, lte, gt, gte, in
        let queryStr = JSON.stringify(queryStrCopy); //Convert JSON to string
        //Must have a $ infront of expressions for mongoDB. Eg. {"salary":{"$gt":"50000"}}
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte|in)\b/g, match => `$${match}`);

        console.log(queryStr);

        //Convert to JSON with JSON.parse()
        this.query = this.query.find(JSON.parse(queryStr)); //Eg. Job.find({"salary":{"$gt":"50000"}});
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            //allow multiple values to sort by
            const sortBy = this.queryStr.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy);
        }
        else {
            //if no sort by provided by user, sord by posting date
            this.query = this.query.sort('-postingDate');
        }
        return this;
    }

    //Only retrieve certain fields from a query
    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        // else {
        //     this.query = this.query.select('-__v'); //Get rid of this field added by MongoDB
        // }
        return this;
    }

    searchByQuery() {
        if (this.queryStr.q) {
            //'-' is used as a space bar in query Strings. Eg. Node Developer = Node-Developer
            const search = this.queryStr.q.split('-').join(' ');
            this.query = this.query.find({ $text: { $search: "\"" + search + "\"" } });
        }
        return this;
    }
}

module.exports = APIFilters;