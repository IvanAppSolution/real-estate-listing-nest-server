import { Injectable } from "@nestjs/common";
// import { AuthService } from "src/auth/auth.service";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateListDto, UpdateListDto } from "./dto/list.dto";
// import { Profile } from "src/profile/profile.entity";

@Injectable()
export class ListService{
    constructor(
        @InjectRepository(List)
        private listRepository: Repository<List>,
    ){}

    async getAllList() {
        return {
            success: true,
            data: await this.listRepository.find({})
        }
        
    }

    public async createList(listDto: CreateListDto){
        const list = this.listRepository.create(listDto);

        //Save the list object
        const result = await this.listRepository.save(list);
        return {
            success: true,
            id: result.id
        }
    }

    public async updateList(id: string, list: UpdateListDto){
        //Update list Object
        const found = await this.listRepository.findOneBy({id});
        // console.log('updateList found list: ', found)
        if (found) {
            await this.listRepository.update(id, list);
            return {
                success: true
            }

        } else {
            return null;
        }
        //Save the list object
        
    }

    public async deleteList(id: string){

        //Delete list
        await this.listRepository.delete(id);

        //Send a response
        return {
            deleted: true,
            success: true
        }
    }

    public async findListById(id: string){
        return {
            success: true,
            data: await this.listRepository.findOneBy({ id })
        } 
    }

    public async findListByUserId(userId: string){
        return {
            success: true,
            data: await this.listRepository.findBy({ userId })
        } 
    }
}