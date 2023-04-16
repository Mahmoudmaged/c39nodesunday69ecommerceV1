
export class ApiFeatures {

    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData
    }

    paginate() {
        let { page, size } = this.queryData;
        if (!page || page <= 0) {
            page = 1
        }
        if (!size || size <= 0) {
            size = 2
        }
        if (size > 20) {
            size = 20
        }

        this.mongooseQuery.limit(size).skip((page - 1) * size)
        return this
    }

    filter() {
        let filterQuery = { ...this.queryData }
        const exclude = ['page', 'size', 'limit', 'fields', 'sort', 'search']
        exclude.forEach(key => {
            if (filterQuery[key]) {
                delete filterQuery[key]
            }
        });
        filterQuery = JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq)/g, match => `$${match}`))
        console.log(filterQuery);
        this.mongooseQuery.find(filterQuery)
        return this
    }


    search() {
        if (this.queryData.search) {
            const { search } = this.queryData
            this.mongooseQuery.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ]
            })
        }
        return this
    }

    sort() {
        if (this.queryData.sort) {
            this.mongooseQuery.sort(this.queryData.sort.replaceAll(",", " "))
        }
        return this
    }


    select() {
        if (this.queryData.fields) {
            this.mongooseQuery.select(this.queryData.fields.replaceAll(",", " "))
        }
        return this
    }
}